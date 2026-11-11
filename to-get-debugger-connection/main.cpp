#include <stdio.h>
#include <string.h>
#include <ctype.h>

#include "pico/stdlib.h"
#include "hardware/pwm.h"

#include "pico/cyw43_arch.h"
#include "btstack.h"

#include "ldr_rgb.h"

// ============================================================
// RGB LED GPIO pins
// ============================================================

#define RED_LED_GPIO    16
#define GREEN_LED_GPIO  17
#define BLUE_LED_GPIO   18

// ============================================================
// BLE advertising
// ============================================================

#define APP_AD_FLAGS 0x06

static const uint8_t adv_data[] = {
    // Flags: LE General Discoverable + BR/EDR not supported
    0x02,
    BLUETOOTH_DATA_TYPE_FLAGS,
    APP_AD_FLAGS,

    // Complete local name: "LDR-RGB"
    0x08,
    BLUETOOTH_DATA_TYPE_COMPLETE_LOCAL_NAME,
    'L', 'D', 'R', '-', 'R', 'G', 'B',

    // Complete list of 128-bit service UUIDs
    // UUID:
    // 19b10000-e8f2-537e-4f6c-d104768a1214
    0x11,
    BLUETOOTH_DATA_TYPE_COMPLETE_LIST_OF_128_BIT_SERVICE_CLASS_UUIDS,
    0x00, 0x00, 0xb1, 0x19,
    0xf2, 0xe8,
    0x7e, 0x53,
    0x4f, 0x6c,
    0xd1, 0x04,
    0x76, 0x8a,
    0x12, 0x14
};

static const uint8_t adv_data_len = sizeof(adv_data);

// ============================================================
// BLE event registration
// ============================================================

static btstack_packet_callback_registration_t
    hci_event_callback_registration;

// ============================================================
// PWM state
// ============================================================

static uint red_slice;
static uint green_slice;
static uint blue_slice;

static uint16_t red_channel;
static uint16_t green_channel;
static uint16_t blue_channel;

// ============================================================
// Current color
// ============================================================

static uint8_t current_red = 65;
static uint8_t current_green = 105;
static uint8_t current_blue = 225;

// ============================================================
// PWM setup
// ============================================================

static void setup_rgb_pwm()
{
    gpio_set_function(RED_LED_GPIO, GPIO_FUNC_PWM);
    gpio_set_function(GREEN_LED_GPIO, GPIO_FUNC_PWM);
    gpio_set_function(BLUE_LED_GPIO, GPIO_FUNC_PWM);

    red_slice = pwm_gpio_to_slice_num(RED_LED_GPIO);
    green_slice = pwm_gpio_to_slice_num(GREEN_LED_GPIO);
    blue_slice = pwm_gpio_to_slice_num(BLUE_LED_GPIO);

    red_channel = pwm_gpio_to_channel(RED_LED_GPIO);
    green_channel = pwm_gpio_to_channel(GREEN_LED_GPIO);
    blue_channel = pwm_gpio_to_channel(BLUE_LED_GPIO);

    // 8-bit PWM range: 0-255
    pwm_config config = pwm_get_default_config();

    pwm_config_set_wrap(&config, 255);

    // Default PWM clock is fast enough for LEDs.
    pwm_config_set_clkdiv(&config, 1.0f);

    pwm_init(red_slice, &config, false);

    if (green_slice != red_slice) {
        pwm_init(green_slice, &config, false);
    }

    if (blue_slice != red_slice &&
        blue_slice != green_slice) {
        pwm_init(blue_slice, &config, false);
    }

    pwm_set_enabled(red_slice, true);

    if (green_slice != red_slice) {
        pwm_set_enabled(green_slice, true);
    }

    if (blue_slice != red_slice &&
        blue_slice != green_slice) {
        pwm_set_enabled(blue_slice, true);
    }
}

// ============================================================
// Set RGB LED color
// ============================================================

static void set_rgb(uint8_t r, uint8_t g, uint8_t b)
{
    current_red = r;
    current_green = g;
    current_blue = b;

    pwm_set_chan_level(red_slice, red_channel, r);
    pwm_set_chan_level(green_slice, green_channel, g);
    pwm_set_chan_level(blue_slice, blue_channel, b);

    printf(
        "RGB updated: R=%u G=%u B=%u\n",
        r,
        g,
        b
    );
}

// ============================================================
// HEX helper
// ============================================================

static int hex_digit(char c)
{
    if (c >= '0' && c <= '9') {
        return c - '0';
    }

    if (c >= 'A' && c <= 'F') {
        return c - 'A' + 10;
    }

    if (c >= 'a' && c <= 'f') {
        return c - 'a' + 10;
    }

    return -1;
}

// ============================================================
// Parse "#RRGGBB"
// ============================================================

static bool parse_hex_color(
    const uint8_t *data,
    uint16_t length,
    uint8_t *r,
    uint8_t *g,
    uint8_t *b
)
{
    if (length != 7) {
        return false;
    }

    if (data[0] != '#') {
        return false;
    }

    int r1 = hex_digit(data[1]);
    int r2 = hex_digit(data[2]);

    int g1 = hex_digit(data[3]);
    int g2 = hex_digit(data[4]);

    int b1 = hex_digit(data[5]);
    int b2 = hex_digit(data[6]);

    if (r1 < 0 || r2 < 0 ||
        g1 < 0 || g2 < 0 ||
        b1 < 0 || b2 < 0) {
        return false;
    }

    *r = (uint8_t)((r1 << 4) | r2);
    *g = (uint8_t)((g1 << 4) | g2);
    *b = (uint8_t)((b1 << 4) | b2);

    return true;
}

// ============================================================
// BLE ATT read callback
// ============================================================

static uint16_t att_read_callback(
    hci_con_handle_t connection_handle,
    uint16_t att_handle,
    uint16_t offset,
    uint8_t *buffer,
    uint16_t buffer_size
)
{
    UNUSED(connection_handle);

    if (att_handle ==
        ATT_CHARACTERISTIC_19b10001_e8f2_537e_4f6c_d104768a1214_01_VALUE_HANDLE) {

        char color[8];

        snprintf(
            color,
            sizeof(color),
            "#%02X%02X%02X",
            current_red,
            current_green,
            current_blue
        );

        return att_read_callback_handle_blob(
            (const uint8_t *)color,
            7,
            offset,
            buffer,
            buffer_size
        );
    }

    return 0;
}

// ============================================================
// BLE ATT write callback
// ============================================================

static int att_write_callback(
    hci_con_handle_t connection_handle,
    uint16_t att_handle,
    uint16_t transaction_mode,
    uint16_t offset,
    uint8_t *buffer,
    uint16_t buffer_size
)
{
    UNUSED(connection_handle);
    UNUSED(offset);

    // Ignore prepare-write / transaction phases for now.
    if (transaction_mode != ATT_TRANSACTION_MODE_NONE) {
        return 0;
    }

    if (att_handle ==
        ATT_CHARACTERISTIC_19b10001_e8f2_537e_4f6c_d104768a1214_01_VALUE_HANDLE) {

        uint8_t r;
        uint8_t g;
        uint8_t b;

        if (parse_hex_color(
                buffer,
                buffer_size,
                &r,
                &g,
                &b
            )) {

            printf("Received BLE color: ");

            for (uint16_t i = 0; i < buffer_size; i++) {
                printf("%c", buffer[i]);
            }

            printf("\n");

            set_rgb(r, g, b);

            return 0;
        }

        printf("Invalid color received over BLE.\n");

        return ATT_ERROR_INVALID_ATTRIBUTE_VALUE_LENGTH;
    }

    return 0;
}

// ============================================================
// BLE packet handler
// ============================================================

static void packet_handler(
    uint8_t packet_type,
    uint16_t channel,
    uint8_t *packet,
    uint16_t size
)
{
    UNUSED(channel);
    UNUSED(size);

    if (packet_type != HCI_EVENT_PACKET) {
        return;
    }

    uint8_t event_type =
        hci_event_packet_get_type(packet);

    switch (event_type) {

        case BTSTACK_EVENT_STATE:

            if (btstack_event_state_get_state(packet)
                == HCI_STATE_WORKING) {

                printf("Bluetooth initialized.\n");
                printf("Advertising as LDR-RGB.\n");

                gap_advertisements_set_params(
                    0x0030,
                    0x0060,
                    0,
                    0,
                    NULL,
                    0x07,
                    0
                );

                gap_advertisements_set_data(
                    adv_data_len,
                    (uint8_t *)adv_data
                );

                gap_advertisements_enable(1);
            }

            break;

        case HCI_EVENT_LE_META:

            if (hci_event_le_meta_get_subevent_code(packet)
                == HCI_SUBEVENT_LE_CONNECTION_COMPLETE) {

                printf("BLE device connected.\n");
            }

            break;

        case HCI_EVENT_DISCONNECTION_COMPLETE:

            printf("BLE device disconnected.\n");

            // Start advertising again.
            gap_advertisements_enable(1);

            break;

        default:
            break;
    }
}

// ============================================================
// Main
// ============================================================

int main()
{
    stdio_init_all();

    sleep_ms(1000);

    printf("\n");
    printf("=============================\n");
    printf("LDR RGB RP2350\n");
    printf("=============================\n");

    // Initialize RGB LEDs.
    setup_rgb_pwm();

    // Initial color: Royal Blue (#4169E1)
    set_rgb(
        current_red,
        current_green,
        current_blue
    );

    // Initialize CYW43 Bluetooth hardware.
    if (cyw43_arch_init()) {
        printf("ERROR: CYW43 initialization failed.\n");
        return 1;
    }

    printf("CYW43 initialized.\n");

    // Initialize Bluetooth protocol layers.
    l2cap_init();

    sm_init();

    sm_set_io_capabilities(
        IO_CAPABILITY_NO_INPUT_NO_OUTPUT
    );

    sm_set_authentication_requirements(0);

    // Initialize GATT server.
    att_server_init(
        profile_data,
        att_read_callback,
        att_write_callback
    );

    // Register HCI event handler.
    hci_event_callback_registration.callback =
        &packet_handler;

    hci_add_event_handler(
        &hci_event_callback_registration
    );

    // Register ATT event handler.
    att_server_register_packet_handler(
        packet_handler
    );

    // Turn Bluetooth on.
    hci_power_control(HCI_POWER_ON);

    printf("Waiting for BLE connection...\n");

    while (true) {
        sleep_ms(1000);
    }

    return 0;
}
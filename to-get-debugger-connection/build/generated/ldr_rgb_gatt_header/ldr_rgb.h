
// clang-format off
// C:/1.2_long_distance_connector_PCB/ldr_code/to-get-debugger-connection/build/generated/ldr_rgb_gatt_header/ldr_rgb.h generated from C:/1.2_long_distance_connector_PCB/ldr_code/to-get-debugger-connection/ldr_rgb.gatt for BTstack
// it needs to be regenerated when the .gatt file is updated. 

// To generate C:/1.2_long_distance_connector_PCB/ldr_code/to-get-debugger-connection/build/generated/ldr_rgb_gatt_header/ldr_rgb.h:
// C:/Users/User/.pico-sdk/sdk/2.2.0/lib/btstack/tool/compile_gatt.py C:/1.2_long_distance_connector_PCB/ldr_code/to-get-debugger-connection/ldr_rgb.gatt C:/1.2_long_distance_connector_PCB/ldr_code/to-get-debugger-connection/build/generated/ldr_rgb_gatt_header/ldr_rgb.h

// att db format version 1

// binary attribute representation:
// - size in bytes (16), flags(16), handle (16), uuid (16/128), value(...)

#include <stdint.h>

// Reference: https://en.cppreference.com/w/cpp/feature_test
#if __cplusplus >= 200704L
constexpr
#endif
const uint8_t profile_data[] =
{
    // ATT DB Version
    1,

    // 0x0001 PRIMARY_SERVICE-19b10000-e8f2-537e-4f6c-d104768a1214
    0x18, 0x00, 0x02, 0x00, 0x01, 0x00, 0x00, 0x28, 0x14, 0x12, 0x8a, 0x76, 0x04, 0xd1, 0x6c, 0x4f, 0x7e, 0x53, 0xf2, 0xe8, 0x00, 0x00, 0xb1, 0x19, 
    // 0x0002 CHARACTERISTIC-19b10001-e8f2-537e-4f6c-d104768a1214 - READ | WRITE | WRITE_WITHOUT_RESPONSE | DYNAMIC
    0x1b, 0x00, 0x02, 0x00, 0x02, 0x00, 0x03, 0x28, 0x0e, 0x03, 0x00, 0x14, 0x12, 0x8a, 0x76, 0x04, 0xd1, 0x6c, 0x4f, 0x7e, 0x53, 0xf2, 0xe8, 0x01, 0x00, 0xb1, 0x19, 
    // 0x0003 VALUE CHARACTERISTIC-19b10001-e8f2-537e-4f6c-d104768a1214 - READ | WRITE | WRITE_WITHOUT_RESPONSE | DYNAMIC
    // READ_ANYBODY, WRITE_ANYBODY
    0x16, 0x00, 0x0e, 0x03, 0x03, 0x00, 0x14, 0x12, 0x8a, 0x76, 0x04, 0xd1, 0x6c, 0x4f, 0x7e, 0x53, 0xf2, 0xe8, 0x01, 0x00, 0xb1, 0x19, 
    // END
    0x00, 0x00, 
}; // total size 53 bytes 


//
// list service handle ranges
//
#define ATT_SERVICE_19b10000_e8f2_537e_4f6c_d104768a1214_START_HANDLE 0x0001
#define ATT_SERVICE_19b10000_e8f2_537e_4f6c_d104768a1214_END_HANDLE 0x0003
#define ATT_SERVICE_19b10000_e8f2_537e_4f6c_d104768a1214_01_START_HANDLE 0x0001
#define ATT_SERVICE_19b10000_e8f2_537e_4f6c_d104768a1214_01_END_HANDLE 0x0003

//
// list mapping between characteristics and handles
//
#define ATT_CHARACTERISTIC_19b10001_e8f2_537e_4f6c_d104768a1214_01_VALUE_HANDLE 0x0003

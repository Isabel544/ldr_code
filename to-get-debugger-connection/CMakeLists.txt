cmake_minimum_required(VERSION 3.13)

include(pico_sdk_import.cmake)

project(ldr_rgb C CXX ASM)

set(CMAKE_C_STANDARD 11)
set(CMAKE_CXX_STANDARD 17)

# This is a Pico 2 W, which contains the CYW43 Bluetooth/Wi-Fi chip.
set(PICO_BOARD pico2_w)

pico_sdk_init()

add_executable(ldr_rgb
    main.cpp
)

target_link_libraries(ldr_rgb
    pico_stdlib
    hardware_pwm
    pico_btstack_ble
    pico_btstack_cyw43
    pico_cyw43_arch_none
)

target_include_directories(ldr_rgb PRIVATE
    ${CMAKE_CURRENT_LIST_DIR}
)

pico_btstack_make_gatt_header(
    ldr_rgb
    PRIVATE
    "${CMAKE_CURRENT_LIST_DIR}/ldr_rgb.gatt"
)

pico_add_extra_outputs(ldr_rgb)
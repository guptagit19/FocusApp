cmake_minimum_required(VERSION 3.13)
add_library(appmodules SHARED
    ../../../../common/jsi/jsi.cpp
    ../../../src/main/jni/MainApplicationModuleProvider.cpp
)

target_include_directories(appmodules PRIVATE
    ../../../../common/jsi
    ../../../src/main/jni
)

target_link_libraries(appmodules
    android
    log
    ${log-lib}
)
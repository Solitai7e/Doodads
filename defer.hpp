#ifndef DEFER_HPP
#define DEFER_HPP

#include <utility>

#ifdef __cpp_exceptions
    #include <exception>
#endif


#define DEFER_DEFCLASS(name, ...)                                        \
    template <typename F>                                                \
    class name {                                                         \
        const F func;                                                    \
                                                                         \
        public:                                                          \
            constexpr name(F &&f) noexcept : func(std::forward<F>(f)) {} \
            __VA_ARGS__                                                  \
            name(name &&) = delete;                                      \
            name &operator=(name &&) = delete;                           \
    }

namespace Defer {
    #if __cplusplus >= 202002L
        DEFER_DEFCLASS(Exit, constexpr ~Exit() { this->func(); });
    #else
        DEFER_DEFCLASS(Exit, ~Exit() { this->func(); });
    #endif

    #ifdef __cpp_exceptions
        DEFER_DEFCLASS(Success, ~Success() {
            if (std::uncaught_exceptions() == 0) this->func();
        });

        DEFER_DEFCLASS(Failure, ~Failure() {
            if (std::uncaught_exceptions() > 0) this->func();
        });
    #endif
}


#define DEFER_ANONNAME2(x, y) x ## _ ## y
#define DEFER_ANONNAME1(x, y) DEFER_ANONNAME2(x, y)
#define DEFER_ANONNAME DEFER_ANONNAME1(defer, __LINE__)

#define DEFER_(policy) const Defer::policy DEFER_ANONNAME = [&]


#define DEFER DEFER_(Exit)

#ifdef __cpp_exceptions
    #define DEFER_SUCCESS DEFER_(Success)
    #define DEFER_FAILURE DEFER_(Failure)
#endif

#endif

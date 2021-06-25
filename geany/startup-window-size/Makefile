.SUFFIXES:




CC      := gcc
PKGCONF := pkg-config


CFLAGS := -s -O3 -std=c18 -pedantic -Wall -Wfatal-errors

LIBS    := glib-2.0 gtk+-3.0 geany
LDLIBS  := $(shell $(PKGCONF) --libs-only-l --libs-only-L $(LIBS))
CFLAGS_ := $(shell $(PKGCONF) --cflags --libs-only-other $(LIBS)) -fPIC


UI_FILES := $(wildcard *.ui)

HEADERS  := $(wildcard *.h) $(addsuffix .h,$(UI_FILES))
SOURCES  := $(wildcard *.c)

OBJS   := $(addsuffix .o,$(basename $(SOURCES)))
TARGET := startup-window-size.so




$(TARGET): $(OBJS)
	$(CC) $(CFLAGS_) $(LDLIBS) -shared $(CFLAGS) -o $(TARGET) $(OBJS)

$(OBJS): $(HEADERS)


clean:
	rm -f *.so *.o *.ui.h


%.o: %.c
	$(CC) $(CFLAGS_) $(CFLAGS) -c $< -o $@

%.ui.h: %.ui
	./ui2h $<


.PHONY: clean

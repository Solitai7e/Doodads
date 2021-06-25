.SUFFIXES:




CC      := gcc
PKGCONF := pkg-config


CFLAGS := -s -O3 -std=c18 -pedantic -Wall -Wfatal-errors

LIBS    := glib-2.0 gtk+-3.0 geany uchardet
LDLIBS  := $(shell $(PKGCONF) --libs-only-l --libs-only-L $(LIBS))
CFLAGS_ := $(shell $(PKGCONF) --cflags --libs-only-other $(LIBS)) -fPIC


HEADERS := $(wildcard *.h)
SOURCES := $(wildcard *.c)

OBJS   := $(addsuffix .o,$(basename $(SOURCES)))
TARGET := chardet.so




$(TARGET): $(OBJS)
	$(CC) $(CFLAGS_) $(LDLIBS) -shared $(CFLAGS) -o $@ $(OBJS)

$(OBJS): $(HEADERS)


clean:
	rm -f *.so *.o


%.o: %.c
	$(CC) $(CFLAGS_) $(CFLAGS) -c $< -o $@


.PHONY: clean

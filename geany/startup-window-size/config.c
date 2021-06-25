#include "config.h"
#include <glib.h>


struct config *config_new(void)
{
    return g_new0(struct config, 1);
}

void config_destroy(struct config *config)
{
    g_free(config);
}

struct config *config_from_keyfile(GKeyFile *keyfile)
{
    GError *error = NULL;


    struct config *config = g_new(struct config, 1);

    config->width = g_key_file_get_integer(
        keyfile, "startup-window-size", "width", &error);

    if (error) goto die_read_width;

    config->height = g_key_file_get_integer(
        keyfile, "startup-window-size", "height", &error);

    if (error) goto die_read_height;

    config->maximize = g_key_file_get_boolean(
        keyfile, "startup-window-size", "maximize", &error);

    if (error) goto die_read_maximize;


    return config;


die_read_maximize:;
die_read_height:;
die_read_width:;

    return NULL;
}

GKeyFile *config_to_keyfile(const struct config *config)
{
    GKeyFile *keyfile = g_key_file_new();

    g_key_file_set_integer(keyfile, "startup-window-size", "width", config->width);
    g_key_file_set_integer(keyfile, "startup-window-size", "height", config->height);
    g_key_file_set_boolean(keyfile, "startup-window-size", "maximize", config->maximize);

    return keyfile;
}

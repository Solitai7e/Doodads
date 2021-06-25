#include <stdlib.h>
#include <stdio.h>
#include <math.h>
#include <glib.h>
#include <geanyplugin.h>

#include "prefs-widget.h"
#include "config.h"


static char *config_path;


static struct config *load_config()
{
    struct config *result = NULL;


    GKeyFile *keyfile = g_key_file_new();

    if (!g_key_file_load_from_file(keyfile, config_path, G_KEY_FILE_NONE, NULL))
        goto die_load_from_file;


    struct config *config = config_from_keyfile(keyfile);
    if (!config) goto die_create_config;


    result = config;


die_create_config:;
die_load_from_file:;

    g_key_file_unref(keyfile);


    return result;
}

static gboolean save_config(const struct config *config)
{
    GKeyFile *keyfile = config_to_keyfile(config);
    gboolean result = g_key_file_save_to_file(keyfile, config_path, NULL);
    g_key_file_unref(keyfile);

    return result;
}

static void on_configure_response(GtkDialog *dialog, int response, void *priv)
{
    if (response != GTK_RESPONSE_OK && response != GTK_RESPONSE_APPLY) return;


    PrefsWidget *prefs_widget = PREFS_WIDGET(priv);

    struct config *config = prefs_widget_to_data(prefs_widget);
    save_config(config);
}

static GtkWidget *configure(GeanyPlugin *plugin, GtkDialog *dialog, void *priv)
{
    GtkWidget *prefs_widget = prefs_widget_new();


    struct config *config = load_config();

    if (config) {
        prefs_widget_load_data(PREFS_WIDGET(prefs_widget), config);
        config_destroy(config);
    }


    g_signal_connect(
        dialog, "response",
        G_CALLBACK(on_configure_response), prefs_widget
    );


    return prefs_widget;
}

static gboolean init(GeanyPlugin *plugin, void *priv)
{
    config_path = g_strconcat(
        plugin->geany_data->app->configdir,
        "/plugins/startup-window-size.conf",
        NULL
    );


    struct config *config = load_config();

    if (config) {
        GtkWindow *window = GTK_WINDOW(plugin->geany_data->main_widgets->window);

        gtk_window_resize(window, config->width, config->height);
        if (config->maximize) gtk_window_maximize(window);

        config_destroy(config);
    }


    return TRUE;
}

static void cleanup(GeanyPlugin *plugin, void *priv)
{
    g_free(config_path);
}


G_MODULE_EXPORT void geany_load_module(GeanyPlugin *plugin)
{
    plugin->info->name        = "Startup Window Size";
    plugin->info->description = "Overrides the default startup window size with a user-provided value";
    plugin->info->version     = "1.0";
    plugin->info->author      = "Solitai7e <p5ychomanti5@protonmail.com>";

    plugin->funcs->init      = init;
    plugin->funcs->cleanup   = cleanup;
    plugin->funcs->configure = configure;

    GEANY_PLUGIN_REGISTER(plugin, 225);
}

#include <stdlib.h>
#include <string.h>
#include <glib.h>
#include <geanyplugin.h>
#include <uchardet.h>


static char *detect_encoding(const char *data, size_t length)
{
    char *result = NULL;
    uchardet_t handle = uchardet_new();


    if (uchardet_handle_data(handle, data, length) != 0)
        goto die_handle_data;

    uchardet_data_end(handle);


    const char *charset = uchardet_get_charset(handle);
    if (charset[0] == '\0') goto die_empty_charset;


    // make a copy as the returned pointer becomes
    // invalid after the uchardet handle is deleted
    result = g_strdup(charset);


die_empty_charset:;
die_handle_data:;

    uchardet_delete(handle);


    return result;
}

static char *document_get_raw_contents(GeanyDocument *document, size_t *result_length)
{
    char *result = NULL;
    ScintillaObject *sci = document->editor->sci;


    char *data; int data_length;

    data_length = sci_get_length(sci);
    data = sci_get_contents(sci, data_length + 1);


    // the retrieved character data is actually also
    // (possibly falsely) decoded, here we re-encode
    // the text with the (presumbly incorrect) encoding
    // to reproduce the original data
    char *reencoded; size_t reencoded_length;

    reencoded = g_convert(
        data, data_length,
        document->encoding, "UTF-8",
        NULL, &reencoded_length, NULL
    );

    if (!reencoded) goto die_convert;


    result = reencoded;
    *result_length = reencoded_length;


die_convert:;

    g_free(data);


    return result;
}

static void on_document_open(GObject *obj, GeanyDocument *document, void *priv)
{
    char *data; size_t data_length;

    data = document_get_raw_contents(document, &data_length);
    if (!data) goto die_get_contents;


    char *encoding = detect_encoding(data, data_length);
    if (!encoding) goto die_detect;


    // "ASCII" is just an alias for UTF-8,
    // nothing needs to be done here
    if (strcmp(encoding, "ASCII") == 0) goto die_is_ascii;


    document_reload_force(document, encoding);


die_is_ascii:;

    g_free(encoding);
die_detect:;

    g_free(data);
die_get_contents:;
}

static gboolean init(GeanyPlugin *plugin, void *priv)
{
    plugin_signal_connect(
        plugin, NULL, "document-open", TRUE,
        G_CALLBACK(on_document_open), NULL
    );

    return TRUE;
}

static void cleanup(GeanyPlugin *plugin, void *priv) {}


G_MODULE_EXPORT void geany_load_module(GeanyPlugin *plugin)
{
    plugin->info->name        = "(Better) Encoding Detection";
    plugin->info->description = "Higher-accuracy encoding detection provided by uchardet";
    plugin->info->version     = "1.0";
    plugin->info->author      = "Solitai7e <p5ychomanti5@protonmail.com>";

    plugin->funcs->init    = init;
    plugin->funcs->cleanup = cleanup;

    GEANY_PLUGIN_REGISTER(plugin, 225);
}

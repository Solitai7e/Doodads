#include "prefs-widget.h"

#include <glib.h>
#include <gtk/gtk.h>

#include "config.h"
#include "prefs-widget.ui.h"




struct _PrefsWidget {
    GtkBox parent;

    GtkSpinButton   *width_input;
    GtkSpinButton   *height_input;
    GtkToggleButton *maximize_toggle;
};

G_DEFINE_TYPE(PrefsWidget, prefs_widget, GTK_TYPE_BOX)


static void prefs_widget_class_init(PrefsWidgetClass *klass)
{
    GtkWidgetClass *wclass = GTK_WIDGET_CLASS(klass);

    gtk_widget_class_set_template(wclass, PREFS_WIDGET_UI);

    gtk_widget_class_bind_template_child(wclass, PrefsWidget, width_input);
    gtk_widget_class_bind_template_child(wclass, PrefsWidget, height_input);
    gtk_widget_class_bind_template_child(wclass, PrefsWidget, maximize_toggle);
}

static void prefs_widget_init(PrefsWidget *self)
{
    gtk_widget_init_template(GTK_WIDGET(self));
}


GtkWidget *prefs_widget_new(void)
{
    return g_object_new(TYPE_PREFS_WIDGET, NULL);
}

struct config *prefs_widget_to_data(PrefsWidget *self)
{
    struct config *config = config_new();

    *config = (struct config) {
        .width    = gtk_spin_button_get_value_as_int(self->width_input),
        .height   = gtk_spin_button_get_value_as_int(self->height_input),
        .maximize = gtk_toggle_button_get_active(self->maximize_toggle)
    };

    return config;
}

void prefs_widget_load_data(PrefsWidget *self, const struct config *config)
{
    gtk_spin_button_set_value(self->width_input, config->width);
    gtk_spin_button_set_value(self->height_input, config->height);
    gtk_toggle_button_set_active(self->maximize_toggle, config->maximize);
}

#ifndef PREFS_WIDGET_HPP
#define PREFS_WIDGET_HPP

#include <glib.h>
#include <gtk/gtk.h>

#include "config.h"


G_DECLARE_FINAL_TYPE(PrefsWidget, prefs_widget, PREFS, WIDGET, GtkBox)
#define TYPE_PREFS_WIDGET (prefs_widget_get_type())

GtkWidget *prefs_widget_new(void);

struct config *prefs_widget_to_data(PrefsWidget *);
void           prefs_widget_load_data(PrefsWidget *, const struct config *);


#endif

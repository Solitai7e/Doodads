#ifndef CONFIG_H
#define CONFIG_H

#include <glib.h>


struct config {
    int width;
    int height;
    gboolean maximize;
};


struct config *config_new(void);
void           config_destroy(struct config *config);

struct config *config_from_keyfile(GKeyFile *keyfile);
GKeyFile      *config_to_keyfile(const struct config *config);


#endif

#ifndef POOL_H
#define POOL_H

#include <stddef.h>


struct pool {
    void *memory;

    size_t object_size;
    size_t slots_free;

    size_t free_slots[];
};

#define SIZEOF_POOL_STRUCT(pool_size) \
    (sizeof(struct pool) + sizeof(size_t) * (pool_size))


void pool_init(struct pool *pool, void *memory, size_t pool_size, size_t object_size)
{
    pool->memory      = memory;
    pool->object_size = object_size;
    pool->slots_free  = pool_size;

    for (size_t i = 0, j = pool_size - 1; i < pool_size; i++, j--)
        pool->free_slots[i] = j;
}

void *pool_allocate(struct pool *pool)
{
    if (pool->slots_free == 0)
        return NULL;

    size_t slot_rel = pool->free_slots[--pool->slots_free] * pool->object_size;
    return (char *) pool->memory + slot_rel;
}

void pool_free(struct pool *pool, void *slot)
{
    size_t slot_rel = (char *) slot - (char *) pool->memory;
    pool->free_slots[pool->slots_free++] = slot_rel / pool->object_size;
}


#endif

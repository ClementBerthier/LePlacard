BEGIN;

CREATE TABLE IF NOT EXISTS public.game
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY,
    name text  NOT NULL,
    picture bytea,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT game_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public."user"
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY,
    identifiant text NOT NULL,
    password text NOT NULL,
    CONSTRAINT user_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.army
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY,
    name text  NOT NULL,
    picture bytea,
    game_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT army_pkey PRIMARY KEY (id),
    CONSTRAINT army_game_id_fkey FOREIGN KEY (game_id)
        REFERENCES public.game (id)
    
       
);

CREATE TABLE IF NOT EXISTS public.box
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ,
    name text  NOT NULL,
    picture bytea,
    game_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT box_pkey PRIMARY KEY (id),
    CONSTRAINT box_game_id_fkey FOREIGN KEY (game_id)
        REFERENCES public.game (id) 
);

CREATE TABLE IF NOT EXISTS public.decor
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ,
    name text NOT NULL,
    picture bytea,
    purchase integer NOT NULL DEFAULT 0,
    "clean-mount" integer NOT NULL DEFAULT 0,
    undercoat integer NOT NULL DEFAULT 0,
    paint integer NOT NULL DEFAULT 0,
    plinth integer NOT NULL DEFAULT 0,
    varnish integer NOT NULL DEFAULT 0,
    box_id integer NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT decor_pkey PRIMARY KEY (id),
    CONSTRAINT decor_box_id_fkey FOREIGN KEY (box_id)
        REFERENCES public.box (id)
        ON DELETE CASCADE,
    CONSTRAINT decor_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public."user" (id)
        ON DELETE CASCADE
       
);

CREATE TABLE IF NOT EXISTS public.figurine
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY,
    name text  NOT NULL,
    picture bytea,
    purchase integer NOT NULL DEFAULT 0,
    "clean-mount" integer NOT NULL DEFAULT 0,
    undercoat integer NOT NULL DEFAULT 0,
    paint integer NOT NULL DEFAULT 0,
    plinth integer NOT NULL DEFAULT 0,
    varnish integer NOT NULL DEFAULT 0,
    box_id integer NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT figurine_pkey PRIMARY KEY (id),
    CONSTRAINT figurine_box_id_fkey FOREIGN KEY (box_id)
        REFERENCES public.box (id)
        ON DELETE CASCADE,
    CONSTRAINT figurine_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public."user" (id)
        ON DELETE CASCADE
);

COMMIT;

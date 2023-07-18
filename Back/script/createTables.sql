BEGIN;

CREATE TABLE IF NOT EXISTS public.games
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY,
    game_name text  NOT NULL,
    picture_path text,
    CONSTRAINT games_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public."user"
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY,
    identifiant text NOT NULL,
    password_user text NOT NULL,
    CONSTRAINT user_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.boxs
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ,
    box_name text  NOT NULL,
    picture_path text,
    game_id integer NOT NULL,
    CONSTRAINT boxs_pkey PRIMARY KEY (id),
    CONSTRAINT boxs_game_id_fkey FOREIGN KEY (game_id)
        REFERENCES public.games (id) 
  
);

CREATE TABLE IF NOT EXISTS public.armies
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY,
    army_name text  NOT NULL,
    picture_path text,
    CONSTRAINT armies_pkey PRIMARY KEY (id)    
);

CREATE TABLE IF NOT EXISTS public.armies_boxs
( army_id integer NOT NULL,
  box_id integer NOT NULL,
  CONSTRAINT armies_boxs_pkey PRIMARY KEY (army_id, box_id),
  CONSTRAINT armies_boxs_army_id_fkey FOREIGN KEY (army_id)
        REFERENCES public.armies (id) ON DELETE CASCADE,
  CONSTRAINT armies_boxs_box_id_fkey FOREIGN KEY (box_id)
        REFERENCES public.boxs (id) ON DELETE CASCADE        
);

CREATE TABLE IF NOT EXISTS public.armies_games
(
    army_id integer NOT NULL,
    game_id integer NOT NULL,
    CONSTRAINT armies_games_pkey PRIMARY KEY (army_id, game_id),
    CONSTRAINT armies_games_army_id_fkey FOREIGN KEY (army_id)
        REFERENCES public.armies (id)
        ON DELETE CASCADE,
    CONSTRAINT armies_games_game_id_fkey FOREIGN KEY (game_id)
        REFERENCES public.games (id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.decors
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ,
    decor_name text NOT NULL,
    picture_path text,
    purchase integer NOT NULL DEFAULT 0,
    cleanMount integer NOT NULL DEFAULT 0,
    undercoat integer NOT NULL DEFAULT 0,
    paint integer NOT NULL DEFAULT 0,
    plinth integer NOT NULL DEFAULT 0,
    varnish integer NOT NULL DEFAULT 0,
    box_name text NOT NULL,
    user_name text NOT NULL,
    box_id integer NOT NULL,
    user_id integer NOT NULL,
    CONSTRAINT decors_pkey PRIMARY KEY (id),
    CONSTRAINT decors_box_id_fkey FOREIGN KEY (box_id)
        REFERENCES public.boxs (id)
        ON DELETE CASCADE,
    CONSTRAINT decors_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public."user" (id)
        ON DELETE CASCADE
       
);

CREATE TABLE IF NOT EXISTS public.figurines
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY,
    figurine_name text  NOT NULL,
    picture_path text,
    purchase integer NOT NULL DEFAULT 0,
    cleanMount integer NOT NULL DEFAULT 0,
    undercoat integer NOT NULL DEFAULT 0,
    paint integer NOT NULL DEFAULT 0,
    plinth integer NOT NULL DEFAULT 0,
    varnish integer NOT NULL DEFAULT 0,
    army_name text NOT NULL,
    user_name text NOT NULL,
    army_id integer NOT NULL,
    user_id integer NOT NULL,
    CONSTRAINT figurines_pkey PRIMARY KEY (id),
    CONSTRAINT figurines_army_id_fkey FOREIGN KEY (army_id)
        REFERENCES public.armies (id)
        ON DELETE CASCADE,
    CONSTRAINT figurines_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public."user" (id)
        ON DELETE CASCADE
);

COMMIT;


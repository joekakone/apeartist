-----------------------------------------------------------------------------------------------------
-- extensions utiles
-----------------------------------------------------------------------------------------------------
create extension if not exists pgcrypto; -- pour un vrai hachage (crypt/gen_salt) si besoin côté sql


-----------------------------------------------------------------------------------------------------
-- fonctions utilitaires (postgres n'a pas "on update current_timestamp" comme mysql)
-----------------------------------------------------------------------------------------------------
create or replace function set_updated_at()
    returns trigger as
$$
begin
    new.updated_at = current_timestamp;
    return new;
end;
$$ language plpgsql;


-----------------------------------------------------------------------------------------------------
-- users & authentication
-----------------------------------------------------------------------------------------------------
-- 1. roles table (lookup table for user authorization)
create table roles
(
    role_id    integer generated always as identity primary key,
    role_name  varchar(50) not null unique,
    created_at timestamp default current_timestamp
);

-- 2. users table (core authentication and profile data)
create table users
(
    user_id       integer generated always as identity primary key,
    username      varchar(50)  not null unique,
    email         varchar(100) not null unique,
    password      varchar(255) not null,
    role_id       integer      not null,
    is_active     boolean   default true,
    --- * ---
    first_name    varchar(50),
    last_name     varchar(50),
    profile_image text,
    --- * ---
    created_at    timestamp default current_timestamp,
    updated_at    timestamp default current_timestamp,
    --- * ---
    constraint fk_user_role foreign key (role_id) references roles (role_id)
);

create trigger trg_users_updated_at
    before update
    on users
    for each row
execute function set_updated_at();
-----------------------------------------------------------------------------------------------------


-----------------------------------------------------------------------------------------------------
-- core app
-----------------------------------------------------------------------------------------------------
-- 3. artists table
--    id        = vrai identifiant technique (pk, utilisé pour toutes les relations internes)
--    artist_id = username de l'utilisateur "artiste" choisi lors de la création
--                (par l'artiste lui-même, ou par un manager qui le sélectionne)
create table artists
(
    id                 integer generated always as identity primary key,
    --- * ---
    artist_id          integer        not null unique,
    manager_id         integer        not null,
    --- * ---
    is_verified        boolean   default false,
    --- * ---
    price              numeric(10, 2) not null,
    --- * ---
    artist_slug        varchar(50),
    artist_name        varchar(50),
    artist_description varchar(100),
    artist_type        varchar(25),
    is_group           boolean   default false,
    --- * ---
    website            text,
    --- * ---
    spotify            text,
    deezer             text,
    applemusic         text,
    --- * ---
    facebook           text,
    youtube            text,
    instagram          text,
    tiktok             text,
    --- * ---
    created_at         timestamp default current_timestamp,
    updated_at         timestamp default current_timestamp,
    --- * ---
    constraint fk_artist_user foreign key (artist_id) references users (user_id)
        on update cascade on delete restrict,
    constraint fk_manager_user foreign key (manager_id) references users (user_id)
        on update cascade on delete restrict
);

create trigger trg_artists_updated_at
    before update
    on artists
    for each row
execute function set_updated_at();

-- règle métier : artist_id doit pointer vers un compte ayant le rôle "Artist",
-- et manager_id vers un compte ayant le rôle "Manager" (ou "Administrator").
-- un check constraint classique ne peut pas faire de lookup inter-tables,
-- on passe donc par un trigger.
create or replace function check_artist_manager_roles()
    returns trigger as
$$
declare
    v_artist_role  varchar(50);
    v_manager_role varchar(50);
begin
    select r.role_name
    into v_artist_role
    from users u
             join roles r on r.role_id = u.role_id
    where u.username = new.artist_id;

    if v_artist_role is distinct from 'Artist' then
        raise exception 'artist_id (%) doit référencer un utilisateur ayant le rôle Artist, trouvé: %',
            new.artist_id, coalesce(v_artist_role, 'inconnu');
    end if;

    select r.role_name
    into v_manager_role
    from users u
             join roles r on r.role_id = u.role_id
    where u.user_id = new.manager_id;

    if v_manager_role not in ('Manager', 'Administrator') then
        raise exception 'manager_id (%) doit référencer un utilisateur ayant le rôle Manager ou Administrator, trouvé: %',
            new.manager_id, coalesce(v_manager_role, 'inconnu');
    end if;

    return new;
end;
$$ language plpgsql;

create trigger trg_artists_check_roles
    before insert or update
    on artists
    for each row
execute function check_artist_manager_roles();


-- 4. reservations table
create table reservations
(
    id         integer generated always as identity primary key,
    user_id    integer        not null,
    artist_id  integer        not null,
    start_date timestamp      not null,
    end_date   timestamp      not null,
    message    varchar(255),

    price      numeric(10, 2) not null,
    status     varchar(20)    not null default 'pending',

    place      varchar(255),
    --- * ---
    latitude   decimal(9, 6),
    longitude  decimal(9, 6),
    --- * ---
    created_at timestamp               default current_timestamp,
    updated_at timestamp               default current_timestamp,
    --- * ---
    constraint fk_reservation_user foreign key (user_id) references users (user_id)
        on update cascade on delete restrict,
    constraint fk_reservation_artist foreign key (artist_id) references artists (id)
        on update cascade on delete restrict,
    constraint chk_reservation_dates check (end_date > start_date),
    constraint chk_reservation_status check (status in ('pending', 'confirmed', 'cancelled', 'completed'))
);

create trigger trg_reservations_updated_at
    before update
    on reservations
    for each row
execute function set_updated_at();


-- 5. reviews table
create table reviews
(
    id             integer generated always as identity primary key,
    reservation_id integer not null unique,
    rating         integer not null,
    comment        varchar(255),
    --- * ---
    created_at     timestamp default current_timestamp,
    updated_at     timestamp default current_timestamp,
    --- * ---
    constraint fk_review_reservation foreign key (reservation_id) references reservations (id)
        on update cascade on delete cascade,
    constraint chk_review_rating check (rating between 1 and 5)
);

create trigger trg_reviews_updated_at
    before update
    on reviews
    for each row
execute function set_updated_at();
-----------------------------------------------------------------------------------------------------


-- performance and search indexes
-- (les colonnes unique, comme artists.artist_id ou reviews.reservation_id,
--  ont déjà un index créé automatiquement par postgres : inutile de le dupliquer)

create index idx_users_email on users (email);
create index idx_users_role on users (role_id);

create index idx_artists_manager on artists (manager_id);
create index idx_artists_type on artists (artist_type);
create index idx_artists_verified on artists (is_verified);

create index idx_reservations_artist on reservations (artist_id);
create index idx_reservations_user on reservations (user_id);
create index idx_reservations_created on reservations (created_at desc);
create index idx_reservations_status on reservations (status);
create index idx_reservations_availability on reservations (artist_id, start_date, end_date);
-----------------------------------------------------------------------------------------------------


-----------------------------------------------------------------------------------------------------
-- initialization
-----------------------------------------------------------------------------------------------------
-- seed system roles
insert into roles (role_name)
values ('Administrator'),
       ('Artist'),
       ('Manager'),
       ('Customer');

-- seed a dummy active admin user
-- attention : md5() n'est pas un algorithme de hachage de mot de passe sûr.
-- utiliser bcrypt / argon2 / scrypt côté application, jamais md5 ou sha1.
insert into users (username, email, password, role_id)
values ('admin', 'joseph.kakone@gmail.com', '<hash_bcrypt_genere_cote_appli>', 1);
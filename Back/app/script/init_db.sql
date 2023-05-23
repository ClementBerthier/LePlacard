CREATE ROLE user_leplacard WITH LOGIN PASSWORD 'leplacard';

CREATE DATABASE "PlacardDB"
    WITH
    OWNER = user_leplacard;
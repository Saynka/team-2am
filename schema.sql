DROP TABLE IF EXISTS places;
CREATE TABLE places (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  temp VARCHAR(255),
  sunrise VARCHAR(255),
  sunset VARCHAR(255),
  windspeed VARCHAR(255)
);
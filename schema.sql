DROP TABLE IF EXISTS places;
CREATE TABLE places (
  id SERIAL PRIMARY KEY,
  location VARCHAR(255),
  description TEXT,
  author VARCHAR(255),
  image VARCHAR(255),
  isbn VARCHAR(255)
);
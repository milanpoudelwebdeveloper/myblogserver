CREATE TABLE category (
    id SERIAL NOT NULL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    image VARCHAR(200),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE blog (
    id SERIAL NOT NULL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    coverImage VARCHAR(200),
    category INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category) REFERENCES category(id) ON DELETE CASCADE

  );

  //add new column published to blog table
  ALTER TABLE blog ADD COLUMN published BOOLEAN DEFAULT FALSE;




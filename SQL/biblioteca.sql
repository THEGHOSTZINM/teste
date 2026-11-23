CREATE TABLE usuarios (
    id_usuario INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE generos (
    id_genero INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE plataformas (
    id_plataforma INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE jogos (
    id_jogo INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    desenvolvedora VARCHAR(100) NOT NULL,
    ano_lancamento INT,
    id_usuario_criador INT,
    FOREIGN KEY (id_usuario_criador) REFERENCES usuarios(id_usuario)
);

CREATE TABLE jogos_generos (
    id_jogo INT NOT NULL,
    id_genero INT NOT NULL,

    PRIMARY KEY (id_jogo, id_genero),
    FOREIGN KEY (id_jogo) REFERENCES jogos(id_jogo),
    FOREIGN KEY (id_genero) REFERENCES generos(id_genero)
);

CREATE TABLE jogos_plataformas (
    id_jogo INT,
    id_plataforma INT,

    PRIMARY KEY (id_jogo, id_plataforma),
    FOREIGN KEY (id_jogo) REFERENCES jogos(id_jogo),
    FOREIGN KEY (id_plataforma) REFERENCES plataformas(id_plataforma)
);

CREATE TABLE biblioteca (
    id_biblioteca INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_jogo INT NOT NULL,
    status VARCHAR(30) NOT NULL,
    
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_jogo) REFERENCES jogos(id_jogo),

    UNIQUE (id_usuario, id_jogo),

    CHECK (status IN (
        'Concluído',
        'Jogando',
        'Quero Jogar'
    ))
);
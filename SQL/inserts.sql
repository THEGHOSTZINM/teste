INSERT INTO generos (nome) VALUES
('Ação'),
('Aventura'),
('RPG'),
('Esporte'),
('Corrida'),
('Estratégia'),
('Simulação'),
('Terror'),
('Plataforma'),
('Luta');

INSERT INTO plataformas (nome) VALUES
('PC'),
('Xbox'),
('Playstation'),
('Nintendo');

INSERT INTO jogos (nome, descricao, desenvolvedora, ano_lancamento) VALUES
(
    'Red Dead Redemption 2',
    'A história se passa em 1899 em uma recriação fictícia do Velho Oeste americano, Red Dead Redemption 2 e acompanha a vida de Arthur Morgan e sua posição na notória gangue Van der Linde, que precisa lidar com seu declínio da gangue enquanto eles são perseguidos por agentes da lei, gangues rivais e agentes Pinkerton.',
    'Rockstar Games',
    2018
),

(
    'Cyberpunk 2077',
    'Cyberpunk 2077 é um RPG de ação e aventura em mundo aberto ambientado em Night City, uma megalópole obcecada por poder, glamour e modificações corporais. Você joga como V, um mercenário fora da lei em busca de um implante único que carrega a chave para a imortalidade.',
    'CD Projekt Red',
    2020
);

INSERT INTO jogos_generos (id_jogo, id_genero) VALUES
(1, 2),
(2, 3);

INSERT INTO usuarios (nome) VALUES
('Davi'),
('Fabiano');

INSERT INTO biblioteca (id_usuario, id_jogo, status) VALUES
(1, 1, 'Jogando'), (1, 2, 'Concluído'),
(2, 1, 'Quero Jogar'), (2, 2, 'Jogando');

INSERT INTO jogos_plataformas (id_jogo, id_plataforma) VALUES
(1, 1), (1, 2), (1, 3),
(2, 1), (2, 2), (2, 3);
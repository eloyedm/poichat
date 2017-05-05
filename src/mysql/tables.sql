drop database if exists senses;

create database if not exists senses;

use senses;

create or replace table game(
	idGame int unsigned not null auto_increment,
    ranking int unsigned,
    primary key(idGame)
);

create or replace table user(
	idUser int unsigned not null auto_increment,
    username varchar(50) unique not null,
    email varchar(50) unique not null,
    password varchar(50) not null,
    info varchar(255),
    status enum('conectado','ausente','ocupado','desconectado') default 'conectado' not null,
    picture text,
    fk_idGame int unsigned,
    points int unsigned default 0,
    record int unsigned default 0,
    primary key(idUser),
    foreign key(fk_idGame) references game(idGame)
);

create or replace table chat(
	idChat int unsigned not null auto_increment,
	speaker int unsigned not null,
    recipient int unsigned not null,
    message text,
    sent datetime default now(),
    primary key(idChat),
    foreign key(speaker) references user(idUser),
    foreign key(recipient) references user(idUser)
);

create or replace table team(
	idTeam int unsigned not null auto_increment,
    name varchar(255) not null,
    creation datetime not null default now(),
    primary key(idTeam)
);

create or replace table crew(
	fk_idTeam int unsigned not null,
    fk_idUser int unsigned not null,
    foreign key(fk_idTeam) references team(idTeam),
    foreign key(fk_idUser) references user(idUser)
);
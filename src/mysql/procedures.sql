delimiter $$

/*TABLA USUARIOS (Usuarios individuales) ---------------------------------------------------------------------*/

create or replace procedure sp_login(
	in _data varchar(50),
    in _password varchar(50)
)
begin
	select * from user
    where _data = email or _data = username and _password = password;
end$$

create or replace procedure sp_setUser(
	in _username varchar(50),
    in _email varchar(50),
    in _password varchar(50),
    in _info varchar(255),
    in _status enum('conectado','ausente','ocupado','desconectado'),
    in _picture text,
    in _fk_idGame int unsigned,
    in _points int unsigned,
    in _record int unsigned
)
begin
	if not exists(select * from user where _email = email) then
		insert into user set
			username 	= _username,
            email 		= _email,
            password 	= _password,
            info 		= _info,
            status 		= _status,
            picture 	= _picture,
            fk_idGame 	= _fk_idGame,
            points 		= _points,
            record 		= _record;
    else
		update user set
            info 		= _info,
            status 		= _status,
            picture 	= _picture,
            fk_idGame 	= _fk_idGame,
            points 		= _points,
            record 		= _record
		where username = _username or email = _email and password = _password;
	end if;
end$$

create or replace procedure sp_getUser(
	in _idUser int unsigned
)
begin
	select * from user
    where _idUser = idUser;
end$$

create or replace procedure sp_insertMessage(
	in _speaker varchar(50),
    in _recipient varchar(50),
    in _message text
)
begin
	declare idSpeaker int unsigned;
    declare idRecipient int unsigned;
    
	select idUser into idSpeaker from user where username = _speaker;
    
    select idUser into idRecipient from user where username = _recipient;
    
    insert into chat set
		speaker 	= idSpeaker,
        recipient 	= idRecipient,
        message 	= _message,
        sent 		= now();
end$$

delimiter ;

call sp_setUser('gerardosoriano97','gerardosoriano97@gmail.com',md5('jgsoriano97'),'Por favor habran la puerta, dejenme salir.',1,null,null,null,null);
call sp_login('gerardosoriano97',md5('jgsoriano97'));
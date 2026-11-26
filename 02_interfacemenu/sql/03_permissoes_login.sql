GRANT SELECT (id_usuario, nome_usuario, login_usuario, senha_usuario,
              nivel_usuario, foto_usuario, ativo_usuario)
ON estoque_bd.usuarios_tb TO 'estoque_app'@'127.0.0.1';

GRANT INSERT ON estoque_bd.historico_tb TO 'estoque_app'@'127.0.0.1';

SHOW GRANTS FOR 'estoque_app'@'127.0.0.1';

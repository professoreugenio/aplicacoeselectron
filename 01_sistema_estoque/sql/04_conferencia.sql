USE estoque_bd;
SELECT id_usuario, nome_usuario, login_usuario, email_usuario,
       nivel_usuario, ativo_usuario, foto_usuario
FROM usuarios_tb ORDER BY id_usuario;

SELECT h.id_historico, h.id_usuario, u.nome_usuario, h.acao,
       h.resultado, h.data_hora
FROM historico_tb h
LEFT JOIN usuarios_tb u ON u.id_usuario = h.id_usuario
ORDER BY h.id_historico DESC LIMIT 30;

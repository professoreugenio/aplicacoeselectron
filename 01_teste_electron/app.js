const botaoTeste = document.querySelector('#btnTeste');
const mensagem = document.querySelector('#mensagem');

botaoTeste.addEventListener('click', () => {
  mensagem.textContent = 'JavaScript funcionando no Electron!';
});

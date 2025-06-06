const API_URL = 'http://localhost:3000/reservas';
const lista = document.getElementById('listaReservas');
const modal = document.getElementById('modalEditar');
const salvarBtn = document.getElementById('salvarEdicao');

// Inputs do modal
const inputId = document.getElementById('editId');
const inputMesa = document.getElementById('editMesa');
const inputNumeroMesa = document.getElementById('editNumeroMesa');
const inputData = document.getElementById('editData');
const inputHorario = document.getElementById('editHorario');
const inputQtd = document.getElementById('editQtdPessoas');
const inputEstacionamento = document.getElementById('editEstacionamento');

// Mostrar/ocultar spinner
function mostrarLoading() {
  document.getElementById('loadingSpinner').classList.remove('hidden');
}
function esconderLoading() {
  document.getElementById('loadingSpinner').classList.add('hidden');
}

// CRUD
async function readReservas() {
  mostrarLoading();
  const res = await fetch(API_URL);
  esconderLoading();
  return res.json();
}
async function readReservaById(id) {
  mostrarLoading();
  const res = await fetch(`${API_URL}/${id}`);
  esconderLoading();
  if (!res.ok) throw new Error("Reserva não encontrada");
  return res.json();
}
async function createReserva(reserva) {
  mostrarLoading();
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reserva)
  });
  esconderLoading();
  if (!res.ok) throw new Error("Erro ao criar reserva");
  return res.json(); // o JSON Server devolve o objeto com ID gerado
}

async function updateReserva(id, reserva) {
  mostrarLoading();
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reserva)
  });
  esconderLoading();
  if (!res.ok) throw new Error("Erro ao atualizar reserva");
  return res.json();
}
async function deleteReserva(id) {
  mostrarLoading();
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE'
  });
  esconderLoading();
  if (!res.ok) throw new Error("Erro ao excluir reserva");
  return true;
}

// Carregar reservas
async function carregarReservas() {
  const reservas = await readReservas();
  lista.innerHTML = '';
  console.log('Reservas carregadas:', reservas); // 👀

  reservas.forEach(reserva => {
    if (!reserva.id) {
      console.warn("Reserva sem ID:", reserva); // alerta se algo estiver errado
      return;
    }

    const li = document.createElement('li');
    li.innerHTML = `
      <div class="reserva-content">
        <div class="reserva-info">
          <strong>Mesa ${reserva.numeroMesa}</strong><br>
          ${reserva.data} às ${reserva.horario}<br>
          ${reserva.qtdPessoas} pessoa(s) – Estacionamento: ${reserva.estacionamento}
        </div>
        <div class="reserva-actions">
          <button onclick="editarReserva('${reserva.id}')">Editar</button>
          <button onclick="excluirReserva('${reserva.id}')">Excluir</button>
        </div>
      </div>
    `;
    lista.appendChild(li);
  });
}


// Editar reserva
async function editarReserva(id) {
  try {
    const reserva = await readReservaById(id);

    inputId.value = reserva.id;
    inputMesa.value = reserva.mesa;
    inputNumeroMesa.value = reserva.numeroMesa;
    inputData.value = reserva.data;
    inputHorario.value = reserva.horario;
    inputQtd.value = reserva.qtdPessoas;
    inputEstacionamento.value = reserva.estacionamento;

    abrirModal();
  } catch (error) {
    console.error(error);
    alert("Erro ao carregar a reserva.");
  }
}

// Salvar edição
salvarBtn.addEventListener('click', async () => {
  const reservaAtualizada = {
    mesa: parseInt(inputMesa.value),
    numeroMesa: inputNumeroMesa.value,
    data: inputData.value,
    horario: inputHorario.value,
    qtdPessoas: parseInt(inputQtd.value),
    estacionamento: inputEstacionamento.value
  };

  const hoje = new Date().toISOString().split('T')[0];

  if (
    !reservaAtualizada.numeroMesa ||
    !reservaAtualizada.data ||
    !reservaAtualizada.horario ||
    isNaN(reservaAtualizada.mesa) ||
    isNaN(reservaAtualizada.qtdPessoas)
  ) {
    alert("Preencha todos os campos corretamente.");
    return;
  }

  if (reservaAtualizada.data < hoje) {
    alert("Não é possível reservar para uma data passada.");
    return;
  }

  try {
    await updateReserva(inputId.value, reservaAtualizada);
    fecharModal();
    carregarReservas();
  } catch (error) {
    alert("Erro ao salvar edição.");
  }
});

// Excluir reserva
async function excluirReserva(id) {
  if (confirm("Deseja excluir esta reserva?")) {
    try {
      await deleteReserva(id);
      carregarReservas();
    } catch (error) {
      alert("Erro ao excluir reserva.");
    }
  }
}

// Modal
function abrirModal() {
  modal.classList.remove('hidden');
}
function fecharModal() {
  modal.classList.add('hidden');
}

window.addEventListener('click', (event) => {
  if (!modal.classList.contains('hidden') && !modal.querySelector('.modal-content').contains(event.target)) {
    fecharModal();
  }
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    fecharModal();
  }
});

// Iniciar
carregarReservas();

// script.js

// Estado atual da reserva
let currentReservation = {
  tableNumber: null,
  tableCapacity: 4,
  selectedDate: '',
  selectedTime: '',
  peopleCount: 2,
  parking: false
};

//Carregar Reservas do JSON Server
async function carregarReservas() {
  try {
    const response = await fetch('http://localhost:3000/reservas');
    if (!response.ok) throw new Error('Erro ao buscar reservas');
    const reservas = await response.json();
    console.log('Reservas carregadas:', reservas);
    return reservas;
  } catch (erro) {
    console.error('Erro ao carregar reservas:', erro);
    return [];
  }
}

// Referências ao DOM
const calendarDays = document.getElementById('calendarDays');
const monthYear = document.getElementById('monthYear');
const reservationModal = document.getElementById('reservationModal');
const confirmationModal = document.getElementById('confirmationModal');
const confirmationDetails = document.getElementById('confirmationDetails');
const peopleCountDisplay = document.getElementById('peopleCount');

// Datas atuais para o calendário
let today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();

// Capacidades das mesas (ajuste conforme necessário)
const tableCapacities = {
  1: 2, 2: 4, 3: 6, 4: 2, 5: 4, 6: 6, 7: 4, 8: 2,
  9: 4, 10: 6, 11: 4, 12: 6, 13: 2, 14: 4, 15: 6, 16: 4,
  17: 2, 18: 8, 19: 4, 20: 6, 21: 4, 22: 2, 23: 6
};

// 1. ABRIR E FECHAR MODAL DE RESERVA
function selectTable(tableNumber) {
  currentReservation.tableNumber = tableNumber;
  currentReservation.tableCapacity = tableCapacities[tableNumber] || 4;
  document.getElementById('selectedTableNumber').textContent = tableNumber;
  document.getElementById('selectedTableCapacity').textContent = currentReservation.tableCapacity;
  reservationModal.style.display = 'flex';
  generateCalendar(currentMonth, currentYear);
  updatePeopleCountDisplay();
  updateReserveButtonState();
}

function closeReservationModal() {
  reservationModal.style.display = 'none';
}

// 2. SELEÇÃO DE HORÁRIO
function selectTime(time, element) {
  currentReservation.selectedTime = time;
  document.querySelectorAll('.time-slot').forEach(slot => slot.classList.remove('active'));
  element.classList.add('active');
  updateReserveButtonState();
}

// 3. CONTROLE DE PESSOAS
function changePeople(amount) {
  const newCount = Math.max(1, currentReservation.peopleCount + amount);
  if (newCount <= currentReservation.tableCapacity) {
    currentReservation.peopleCount = newCount;
    updatePeopleCountDisplay();
  }
}

function updatePeopleCountDisplay() {
  const count = currentReservation.peopleCount;
  peopleCountDisplay.textContent = `${count} ${count === 1 ? 'pessoa' : 'pessoas'}`;
}

// 4. SELEÇÃO DE ESTACIONAMENTO
function selectParking(wantsParking, element) {
  currentReservation.parking = wantsParking;
  document.querySelectorAll('.parking-option').forEach(opt => opt.classList.remove('active'));
  element.classList.add('active');
}

// 5. ATIVAR/DESATIVAR BOTÃO RESERVAR
function updateReserveButtonState() {
  const reserveBtn = document.querySelector('.reserve-btn');
  const canReserve = currentReservation.tableNumber
    && currentReservation.selectedDate
    && currentReservation.selectedTime;
  reserveBtn.disabled = !canReserve;
  reserveBtn.textContent = canReserve ? 'Confirmar Reserva' : 'Selecione Data e Horário';
}

// 6. SELEÇÃO DE DATA NO CALENDÁRIO
function selectDate(day, month, year, element) {
  const selected = new Date(year, month, day);
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Zera a hora para comparar só a data

  if (selected < now) {
    alert('Você não pode selecionar uma data passada.');
    return;
  }

  currentReservation.selectedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('active'));
  element.classList.add('active');
  updateReserveButtonState();
}

// 7. GERAR CALENDÁRIO
function generateCalendar(month, year) {
  calendarDays.innerHTML = '';
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = [
    'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
  ];

  monthYear.textContent = `${monthNames[month]} ${year}`;

  // Preencher espaços antes do primeiro dia
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.classList.add('calendar-day', 'empty');
    calendarDays.appendChild(empty);
  }

  // Preencher dias do mês
  for (let day = 1; day <= daysInMonth; day++) {
    const dayElem = document.createElement('div');
    dayElem.classList.add('calendar-day');
    dayElem.textContent = day;

    // Destaca se for a data selecionada
    const formatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (currentReservation.selectedDate === formatted) {
      dayElem.classList.add('active');
    }

    dayElem.onclick = function() {
      selectDate(day, month, year, this);
    };
    calendarDays.appendChild(dayElem);
  }
}

function changeMonth(direction) {
  currentMonth += direction;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  } else if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }

  // Bloquear meses anteriores ao atual
  const now = new Date();
  if (
    currentYear < now.getFullYear() ||
    (currentYear === now.getFullYear() && currentMonth < now.getMonth())
  ) {
    currentMonth = now.getMonth();
    currentYear = now.getFullYear();
    return;
  }

  generateCalendar(currentMonth, currentYear);
}

// Selecionar horário
function selectTime(time) {
    // Remover seleção anterior
    document.querySelectorAll('.time-slot.active').forEach(slot => {
        slot.classList.remove('active');
    });
    
    // Adicionar seleção atual
    event.target.classList.add('active');
    
    // Salvar horário selecionado
    currentReservation.selectedTime = time;
    
    updateReserveButtonState();
}

// 8. CRIAR OBJETO DE RESERVA
function createReservationObject() {
  return {
    id: Date.now(),
    mesa: currentReservation.tableNumber,
    numeroMesa: String(currentReservation.tableNumber).padStart(2, '0'),
    data: currentReservation.selectedDate,
    horario: currentReservation.selectedTime,
    qtdPessoas: currentReservation.peopleCount,
    estacionamento: currentReservation.parking ? 'Sim' : 'Não',
    status: 'confirmada',
    dataReserva: new Date().toISOString()
  };
}


// 9. FAZER RESERVA E EXIBIR MODAL DE CONFIRMAÇÃO
function makeReservation() {
  if (!currentReservation.tableNumber
    || !currentReservation.selectedDate
    || !currentReservation.selectedTime) {
    alert('Por favor, selecione mesa, data e horário.');
    return;
  }

  const reserva = createReservationObject();

  fetch('http://localhost:3000/reservas', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(reserva)
})
.then(res => res.json())
.then(data => {
  showConfirmationModal(data);
  closeReservationModal();
})
.catch(error => {
  alert('Reserva realizada!.');
});


  confirmationDetails.innerHTML = `
    <p><strong>Mesa:</strong> ${reserva.numeroMesa}</p>
    <p><strong>Data:</strong> ${reserva.data}</p>
    <p><strong>Horário:</strong> ${reserva.horario}</p>
    <p><strong>Pessoas:</strong> ${reserva.qtdPessoas}</p>
    <p><strong>Estacionamento:</strong> ${reserva.estacionamento}</p>
  `;

  confirmationModal.classList.add('active');
  document.body.style.overflow = 'hidden';
  closeReservationModal();
}

function closeConfirmationModal() {
  confirmationModal.classList.remove('active');
  document.body.style.overflow = '';
  window.location.href = 'index.html';
}

// ------------------------------------------
// 10. FECHAR MODAIS AO CLICAR FORA / ESC
// ------------------------------------------

document.addEventListener('click', (event) => {
  if (event.target === reservationModal) {
    closeReservationModal();
  }
  if (event.target === confirmationModal) {
    closeConfirmationModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeReservationModal();
    closeConfirmationModal();
  }
});

// 11. INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
  generateCalendar(currentMonth, currentYear);
  updatePeopleCountDisplay();
  updateReserveButtonState();
});

// 12.Menu lateral
function toggleMenu(icon) {
    icon.classList.toggle("active");
    document.getElementById("sideMenu").classList.toggle("active");
}

// Fechar menu ao clicar em link
document.querySelectorAll('.side-menu a').forEach(link => {
    link.addEventListener('click', () => {
        document.querySelector('.menu-toggle').classList.remove('active');
        document.getElementById('sideMenu').classList.remove('active');
    });
});

// Fechar menu ao clicar fora
document.addEventListener('click', (event) => {
    const menu = document.getElementById('sideMenu');
    const toggle = document.querySelector('.menu-toggle');
    
    if (!menu.contains(event.target) && !toggle.contains(event.target)) {
        menu.classList.remove('active');
        toggle.classList.remove('active');
    }
});

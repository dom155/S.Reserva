document.addEventListener('DOMContentLoaded', () => {

  const API_URL = 'http://localhost:3000/reservas';
  const TABLE_CAPACITIES = {
    1: 2, 2: 4, 3: 6, 4: 2, 5: 4, 6: 6, 7: 4, 8: 2,
    9: 4, 10: 6, 11: 4, 12: 6, 13: 2, 14: 4, 15: 6, 16: 4,
    17: 2, 18: 8, 19: 4, 20: 6, 21: 4, 22: 2, 23: 6
  };

  let allReservations = [];
  let selectedDateForFilter = new Date();
  let currentReservation = {};
  let isReserving = false;

  // --- SELETORES DE ELEMENTOS DO DOM ---
  const dom = {
    mainCalendarDays: document.getElementById('main-calendar-days'),
    mainMonthYear: document.getElementById('main-month-year'),
    prevMonthBtn: document.getElementById('main-prev-month'),
    nextMonthBtn: document.getElementById('main-next-month'),
    allTableElements: document.querySelectorAll('.table'),
    reservationModal: document.getElementById('reservationModal'),
    closeReservationModalBtn: document.getElementById('close-reservation-modal-btn'),
    selectedTableNumberSpan: document.getElementById('selectedTableNumber'),
    selectedTableCapacitySpan: document.getElementById('selectedTableCapacity'),
    timeSlotsContainer: document.getElementById('timeSlots'),
    peopleCountSpan: document.getElementById('peopleCount'),
    decreasePeopleBtn: document.getElementById('decrease-people-btn'),
    increasePeopleBtn: document.getElementById('increase-people-btn'),
    parkingOptions: document.querySelectorAll('.parking-option'),
    confirmReservationBtn: document.getElementById('confirm-reservation-btn'),
    confirmationModal: document.getElementById('confirmationModal'),
    confirmationDetails: document.getElementById('confirmationDetails'),
    closeConfirmationModalBtn: document.getElementById('close-confirmation-modal-btn'),
    sideMenu: document.getElementById('sideMenu'),
    menuToggle: document.getElementById('menu-toggle')
  };

  // --- FUNÇÕES DE LÓGICA ---

  const renderMainCalendar = (year, month) => {
    dom.mainCalendarDays.innerHTML = '';
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    dom.mainMonthYear.textContent = `${monthNames[month]} ${year}`;
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < firstDayOfMonth; i++) {
      dom.mainCalendarDays.innerHTML += `<div class="calendar-day empty"></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayElem = document.createElement('div');
      dayElem.classList.add('calendar-day');
      dayElem.textContent = day;
      const currentDate = new Date(year, month, day);

      if (currentDate < today) {
        dayElem.classList.add('disabled');
      } else {
        dayElem.addEventListener('click', () => {
          selectedDateForFilter = currentDate;
          renderMainCalendar(year, month);
          updateTableStatusForDate(currentDate);
        });
      }
      if (currentDate.getTime() === selectedDateForFilter.getTime()) {
        dayElem.classList.add('active');
      }
      dom.mainCalendarDays.appendChild(dayElem);
    }
  };

  const updateTableStatusForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    const reservedTablesForDate = allReservations
      .filter(reserva => reserva.data === dateString)
      .map(reserva => reserva.mesa);

    dom.allTableElements.forEach(table => {
      const tableId = parseInt(table.dataset.tableId);
      table.classList.remove('occupied', 'selected');
      if (reservedTablesForDate.includes(tableId)) {
        table.classList.add('occupied');
      }
    });
  };

  const changeMainCalendarMonth = (direction) => {
    const currentYear = selectedDateForFilter.getFullYear();
    const currentMonth = selectedDateForFilter.getMonth();
    const newDate = new Date(currentYear, currentMonth + direction, 1);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (newDate.getFullYear() < today.getFullYear() || (newDate.getFullYear() === today.getFullYear() && newDate.getMonth() < today.getMonth())) {
      return;
    }
    selectedDateForFilter = newDate;
    renderMainCalendar(selectedDateForFilter.getFullYear(), selectedDateForFilter.getMonth());
  };

  const openReservationModal = (tableNumber) => {
    const tableElement = document.querySelector(`.table[data-table-id='${tableNumber}']`);
    if (tableElement.classList.contains('occupied')) {
      alert('Esta mesa já está ocupada.');
      return;
    }

    dom.allTableElements.forEach(t => t.classList.remove('selected'));
    tableElement.classList.add('selected');

    const capacity = TABLE_CAPACITIES[tableNumber] || 0; 

    currentReservation = {
      tableNumber: tableNumber,
      tableCapacity: capacity,
      selectedDate: selectedDateForFilter.toISOString().split('T')[0],
      peopleCount: 2,
      selectedTime: null,
      parking: false
    };

    dom.selectedTableNumberSpan.textContent = tableNumber;
    dom.selectedTableCapacitySpan.textContent = capacity;
    dom.peopleCountSpan.textContent = `2 pessoas`;

    dom.timeSlotsContainer.querySelectorAll('.time-slot').forEach(s => s.classList.remove('active'));
    dom.parkingOptions.forEach(o => o.classList.remove('active'));

    dom.reservationModal.style.display = 'flex';
  };

  const closeReservationModal = () => {
    dom.reservationModal.style.display = 'none';
    dom.allTableElements.forEach(t => t.classList.remove('selected'));
  };

  const showConfirmationModal = (reserva) => {
    const dateParts = reserva.data.split('-');
    const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
    dom.confirmationDetails.innerHTML = `
            <p><strong>Mesa:</strong> ${reserva.numeroMesa}</p>
            <p><strong>Data:</strong> ${formattedDate}</p>
            <p><strong>Horário:</strong> ${reserva.horario}</p>
            <p><strong>Pessoas:</strong> ${reserva.qtdPessoas}</p>
            <p><strong>Estacionamento:</strong> ${reserva.estacionamento ? 'Sim' : 'Não'}</p>`;
    dom.confirmationModal.style.display = 'flex';
  };

  const closeConfirmationModal = () => {
    dom.confirmationModal.style.display = 'none';
  };

  const changePeople = (amount) => {
    const newCount = currentReservation.peopleCount + amount;
    if (newCount >= 1 && newCount <= currentReservation.tableCapacity) {
      currentReservation.peopleCount = newCount;
      dom.peopleCountSpan.textContent = `${newCount} ${newCount === 1 ? 'pessoa' : 'pessoas'}`;
    } else if (newCount > currentReservation.tableCapacity) {
      alert(`A capacidade máxima para esta mesa é de ${currentReservation.tableCapacity} pessoas.`);
    }
  };

  const makeReservation = async () => {
    if (isReserving) return;

    if (!currentReservation.selectedTime) {
      alert('Por favor, selecione um horário.');
      return;
    }

    isReserving = true;
    dom.confirmReservationBtn.disabled = true;
    dom.confirmReservationBtn.textContent = 'Reservando...';

    const reservationData = {
      id: Date.now(),
      mesa: currentReservation.tableNumber,
      numeroMesa: String(currentReservation.tableNumber).padStart(2, '0'),
      data: currentReservation.selectedDate,
      horario: currentReservation.selectedTime,
      qtdPessoas: currentReservation.peopleCount,
      estacionamento: currentReservation.parking,
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservationData),
      });
      if (!response.ok) throw new Error('Falha ao criar reserva');

      const newReservation = await response.json();
      allReservations.push(newReservation);
      updateTableStatusForDate(selectedDateForFilter);

      closeReservationModal();

      // MOSTRA O MODAL DE CONFIRMAÇÃO COM DETALHES
      showConfirmationModal(newReservation);

      // setTimeout PARA GARANTIR QUE O MODAL RENDERIZE ANTES DO ALERTA
      setTimeout(() => {
        alert("🍽️Reserva feita com sucesso!🎉");
      }, 50); 

    } catch (error) {
      console.error('Erro ao fazer reserva:', error);
      alert('Ocorreu um erro ao tentar fazer a reserva.');
    } finally {
      isReserving = false;
      dom.confirmReservationBtn.disabled = false;
      dom.confirmReservationBtn.textContent = 'Confirmar Reserva';
    }
  };

  const toggleMenu = () => {
    if (dom.menuToggle && dom.sideMenu) {
      dom.menuToggle.classList.toggle("active");
      dom.sideMenu.classList.toggle("active");
    }
  };

  // --- INICIALIZAÇÃO E EVENT LISTENERS ---

  const init = async () => {
    try {
      const response = await fetch(API_URL);
      allReservations = await response.json();
      selectedDateForFilter.setHours(0, 0, 0, 0);
      renderMainCalendar(selectedDateForFilter.getFullYear(), selectedDateForFilter.getMonth());
      updateTableStatusForDate(selectedDateForFilter);
    } catch (error) {
      console.error('Erro ao inicializar a página:', error);
      alert('Não foi possível carregar os dados das reservas.');
    }

    if (dom.prevMonthBtn) dom.prevMonthBtn.addEventListener('click', () => changeMainCalendarMonth(-1));
    if (dom.nextMonthBtn) dom.nextMonthBtn.addEventListener('click', () => changeMainCalendarMonth(1));
    if (dom.menuToggle) dom.menuToggle.addEventListener('click', toggleMenu);
    if (dom.closeReservationModalBtn) dom.closeReservationModalBtn.addEventListener('click', closeReservationModal);
    if (dom.closeConfirmationModalBtn) dom.closeConfirmationModalBtn.addEventListener('click', closeConfirmationModal);
    if (dom.decreasePeopleBtn) dom.decreasePeopleBtn.addEventListener('click', () => changePeople(-1));
    if (dom.increasePeopleBtn) dom.increasePeopleBtn.addEventListener('click', () => changePeople(1));
    if (dom.confirmReservationBtn) dom.confirmReservationBtn.addEventListener('click', makeReservation);

    dom.allTableElements.forEach(table => {
      table.addEventListener('click', () => openReservationModal(parseInt(table.dataset.tableId)));
    });

    dom.timeSlotsContainer.querySelectorAll('.time-slot').forEach(slot => {
      slot.addEventListener('click', () => {
        currentReservation.selectedTime = slot.dataset.time;
        dom.timeSlotsContainer.querySelectorAll('.time-slot').forEach(s => s.classList.remove('active'));
        slot.classList.add('active');
      });
    });

    dom.parkingOptions.forEach(option => {
      option.addEventListener('click', () => {
        currentReservation.parking = option.dataset.parking === 'true';
        dom.parkingOptions.forEach(o => o.classList.remove('active'));
        option.classList.add('active');
      });
    });

    window.addEventListener('click', (event) => {
      if (event.target === dom.reservationModal) closeReservationModal();
      if (event.target === dom.confirmationModal) closeConfirmationModal();

      if (dom.sideMenu && dom.menuToggle) {
        const isMenuOpen = dom.sideMenu.classList.contains('active');
        const isClickOutside = !dom.sideMenu.contains(event.target) && !dom.menuToggle.contains(event.target);
        if (isMenuOpen && isClickOutside) {
          toggleMenu();
        }
      }
    });
  };

  init();
});

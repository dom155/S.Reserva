const BASE_URL = "http://localhost:3000/reservas";

// GET todas
async function readReservas() {
  const res = await fetch(BASE_URL);
  return res.json();
}

// GET por ID
async function readReservaById(id) {
  const res = await fetch(`${BASE_URL}/${id}`);
  return res.json();
}

// POST
async function createReserva(reserva) {
  await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reserva)
  });
}

// PUT
async function updateReserva(id, reserva) {
  await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reserva)
  });
}

// DELETE
async function deleteReserva(id) {
  await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE'
  });
}

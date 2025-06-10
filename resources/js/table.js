function updateCountdowns() {
    const rows = document.querySelectorAll("#TodoTableBody tr");

    rows.forEach(row => {
        const countdownCell = row.querySelector(".timeRemaining");
        // const endTimeStr = countdownCell.getAttribute("data-end-date") + "T00:00:00Z";
        const endTimeStr = countdownCell.getAttribute("data-end-date");
        console.log(endTimeStr)
        const endTime = new Date(endTimeStr);
        const now = new Date();

        const timeDiff = endTime.getTime() - now.getTime();

        if (timeDiff < 0) {
            countdownCell.textContent = "Deadline Passed";
            return;
        }

        const secondsRemaining = Math.floor(timeDiff / 1000);
        const days = Math.floor(secondsRemaining / (3600 * 24));
        const hours = Math.floor((secondsRemaining % (3600 * 24)) / 3600);
        const minutes = Math.floor((secondsRemaining % 3600) / 60);
        const seconds = secondsRemaining % 60;

        countdownCell.textContent = `${days}d, ${hours}h, ${minutes}m, ${seconds}s`;
    });
}

setInterval(updateCountdowns, 1000);
updateCountdowns();

document.querySelectorAll(".deleteButton").forEach(button => {
    button.addEventListener('click', function() {
        const listingId = this.closest('tr').getAttribute('data-listing-id');
        const formData = {
            id: listingId
        };
        const row = this.closest('tr');

        fetch('/api/delete_task', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        
        .then(response => {
            let status = response.status;
            if (status === 204) {
                row.remove();
            }else if (status === 400 || status === 404) {
                alert("fail");
            }
        })
    });
});

document.querySelectorAll(".checkButton").forEach(button => {
    button.addEventListener('click', function() {
        const listingId = this.closest('tr').getAttribute('data-listing-id');
        const currentStatus = this.closest('tr').getAttribute('data-status');
        let newStatus;
        if (currentStatus === "TODO") {
            newStatus = "DONE";
        }else if (currentStatus === "DONE") {
            newStatus = "TODO";
        }
        const formData = {
            id:listingId,
            status: newStatus
        };

        fetch('/api/check_task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        
        .then(response => {
            let status = response.status;
            if (status === 204) {
                const row = this.closest('tr');
                const statusCell = row.querySelector('.status')
                const buttonText = row.querySelector('.checkButton')
                statusCell.textContent = newStatus;
                if (newStatus === "TODO") {
                    buttonText.textContent = "Check";
                }else if (newStatus === "DONE") {
                    buttonText.textContent = "Uncheck";
                }
                row.setAttribute('data-status', newStatus);
            }else if (status === 400 || status === 404) {
                alert("fail");
            }
        })
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const filterForm = document.getElementById('filterForm');
    const statusFilter = document.getElementById('statusFilter');
    const taskTable = document.getElementById('TodoTableBody');
  
    statusFilter.addEventListener('change', () => {
      const filterValue = statusFilter.value.toLowerCase();
      const rows = taskTable.querySelectorAll('tr');
  
      rows.forEach(row => {
        const status = row.getAttribute('data-status').toLowerCase();
        console.log(status);

        if (filterValue === 'fail') {
            const deadline = new Date(row.getAttribute('data-deadline'));
            if (deadline < new Date() && status ==='todo') {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }else if (filterValue === 'all' || status === filterValue) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
});

document.querySelector('.sortButton').addEventListener('click', () => {
    const tableBody = document.getElementById('TodoTableBody');
    const rows = Array.from(tableBody.querySelectorAll('tr'));
    console.log(rows);

    rows.sort((rowA, rowB) => {
        const deadlineA = new Date(rowA.getAttribute('data-deadline'));
        const deadlineB = new Date(rowB.getAttribute('data-deadline'));

        return deadlineA - deadlineB;
    });

    tableBody.innerHTML = '';
    rows.forEach(row => tableBody.appendChild(row));
});
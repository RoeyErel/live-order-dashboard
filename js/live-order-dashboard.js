jQuery(document).ready(function ($) {
	function fetchOrders() {
		$.ajax({
			url: dashboardAjax.ajax_url,
			type: 'POST',
			data: {
				action: 'get_live_orders'
			},
			success: function (response) {
				let table = `
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>תאריך</th>
                                <th>סה"כ</th>
                                <th>סטטוס</th>
                                <th>זמן שעבר</th>
                            </tr>
                        </thead>
                        <tbody>
                `;

				response.forEach(function (order) {
					if (order.status !== 'completed') {
						let statusText = translateStatus(order.status); // תרגום סטטוס
						let statusClass = `order-status ${order.status}`;
						let dateParts = formatDateTime(order.date); // פורמט תאריך
						let elapsedTime = calculateElapsedTime(order.date); // זמן שעבר
						table += `
                            <tr>
                                <td>${order.id}</td>
                                <td>${dateParts.date}<br>${dateParts.time}</td>
                                <td>${order.total} ₪</td>
                                <td><span class="${statusClass}">${statusText}</span></td>
                                <td>${elapsedTime}</td>
                            </tr>
                        `;
					}
				});

				table += `
                        </tbody>
                    </table>
                `;

				$('#orders').html(table);
			}
		});
	}

	// פונקציה לתרגום סטטוס
	function translateStatus(status) {
		switch (status) {
			case 'processing':
				return 'בהכנה';
			case 'pending':
				return 'ממתין';
			case 'on-hold':
				return 'בהמתנה';
			default:
				return status; // מחזיר את הסטטוס המקורי אם אין תרגום
		}
	}

	// פונקציה לפורמט תאריך ושעה
	function formatDateTime(dateTime) {
		let dateObj = new Date(dateTime);
		let date = dateObj.toLocaleDateString('he-IL'); // תאריך בפורמט עברי
		let time = dateObj.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }); // שעה
		return { date, time };
	}

	// פונקציה לחישוב זמן שעבר
	function calculateElapsedTime(orderDate) {
		let orderTime = new Date(orderDate);
		let now = new Date();
		let diff = Math.abs(now - orderTime); // הפרש בזמן
		let hours = Math.floor(diff / (1000 * 60 * 60)); // חישוב שעות
		let minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)); // חישוב דקות
		return `${hours} שעות ${minutes} דקות`;
	}

	setInterval(fetchOrders, 5000); // עדכון כל 5 שניות
	fetchOrders();
});

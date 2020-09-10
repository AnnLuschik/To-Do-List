// Установка минимальной даты в поле ввода, корректировка по часовому поясу UTC+3
document.querySelectorAll('input[type=date]').forEach(item => {
	let hoursNow = new Date().getHours();
	let today = new Date();
	if(hoursNow < 3) {
		today.setHours(3);
	}
	item.min = today.toISOString().split('T')[0];
});

// Перевод даты в формат dd.mm.yyyy
export function toLocalDate(date) {
	let localDate = date.split('-');
	return localDate.reverse().join('.');
}

// Создание объекта Date из заголовка задачи, корректировка по часовому поясу UTC+3
export function fromLocalDate(date) {
	let newDate = new Date();
	let hoursNow = new Date().getHours();
	if(hoursNow < 3) {
		newDate.setHours(3);
	}
	let currentDate = date.split('.');
	newDate.setFullYear(currentDate[2], currentDate[1] - 1, currentDate[0]);
	return newDate;
}

// Перевод даты в формат yyyy-mm-dd
export function fromLocalDateToString(date) {
	return date.toISOString().split('T')[0];
}

// Сравнение двух дат
export function compareDate(date) {
	let today = new Date();
	let userDate = fromLocalDate(date);
	if(userDate >= today) {
		return true;
	} else {
		return false;
	}
}
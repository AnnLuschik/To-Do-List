let content = document.querySelector('.content');
let addTaskForm = document.forms.mainForm;
let addTaskInput = addTaskForm.elements.task;
let addTaskDateInput = addTaskForm.elements.date;
let addTaskButton = document.querySelector('.add-button');

let changeDateForm = document.forms.modalDateForm;
let changeDateInput = changeDateForm.elements.dateInput;

let taskList = document.querySelector('.list');
let todoBoard = document.querySelector('.todo-board');

let modalConfirmWindow = document.querySelector('.modal-confirm');
let modalAlertWindow = document.querySelector('.modal-alert');
let modalChangeWindow = document.querySelector('.modal-change-date');

// Установка минимальной даты в поле ввода
document.querySelectorAll('input[type=date]').forEach(item => {
	item.min = new Date().toISOString().split('T')[0];
});

// Перевод даты введённой в поле, в формат dd.mm.yyyy
function toLocalDate(input) {
	let localDate = input.value.split('-');
	return localDate.reverse().join('.');
}

// Перевод даты в формат yyyy-mm-dd
function fromLocalDate(date) {
	let newDate = new Date();
	let currentDate = date.split('.');
	newDate.setFullYear(currentDate[2], currentDate[1], currentDate[0]);
	return newDate;
}

// Сравнение двух дат
function compareDate(date) {
	let today = new Date();
	let userDate = fromLocalDate(date);
	userDate >= today ? true : false;
}

// Проверка на пустые поля
function isNoEmptyFields(object) {
	for (let key in object) {
		if (object[key].value === '') return false;
	}
	return true;
}

// Очистить поля формы

// Получение количества задач и запись в заголовок блока
function getTaskNumber(list) {
	return list.length;
}

function createTaskNumber(title) {
	title.innerHTML = getTaskNumber(title.parentElement.nextElementSibling.children);
}

document.querySelectorAll('h2').forEach(item => createTaskNumber(item.firstElementChild));

let mutationObserver = new MutationObserver(mutationList => {
	mutationList.forEach(mutation => {
		if (mutation.target.tagName === 'UL') {
			createTaskNumber(mutation.target.previousElementSibling.firstElementChild);
		}
	});
});

mutationObserver.observe(document.querySelector('.content'), {
	childList: true,
	subtree: true,
});

// Создание 'delete' и 'remove' кнопок
function createDeleteIcon() {
	let icon = document.createElement('button');
	icon.classList.add('icon', 'close-icon');
	return icon;
}

function createRemoveIcon() {
	let icon = document.createElement('button');
	icon.classList.add('icon', 'remove-icon');
	return icon;
}

function createIconContainer() {
	let container = document.createElement('div');
	container.classList.add('icon-container');
	container.append(createDeleteIcon(), createRemoveIcon());
	return container;
}

// Создание текстовой части новой задачи
function createTaskTimeElement() {
	let taskDate = document.createElement('p');
	taskDate.classList.add('task__time');
	taskDate.append(document.createTextNode(toLocalDate(addTaskDateInput)));
	return taskDate;
}

function createTaskTextElement() {
	let taskText = document.createElement('p');
	taskText.classList.add('task__text');
	taskText.append(document.createTextNode(addTaskInput.value));
	return taskText;
}

function createTextContainer() {
	let container = document.createElement('div');
	container.classList.add('text-container');
	container.append(createTaskTimeElement());
	container.append(createTaskTextElement());
	return container;
}

// Создать новую задачу
function getTask() {
	let task = document.createElement('li');
	task.classList.add('task');
	task.append(createTextContainer());
	task.append(createIconContainer());
	return task;
}

// Открыть модальное окно для подтверждения удаления
function openModalConfirmWindow() {
	modalConfirmWindow.style.display = 'flex';
	document.querySelector('.fogging').style.display = 'block';
	let promiseModal = new Promise(function (resolve, reject) {
		modalConfirmWindow.addEventListener('click', function (event) {
			if (event.target.classList.contains('button__confirm')) {
				resolve();
			}
			if (event.target.classList.contains('button__cancel')) {
				reject();
			}
		});
	});
	return promiseModal;
}

// Открыть модальное окно с предупреждением о лимите в 5 задач в блоке DOING
function openModalAlertWindow() {
	modalAlertWindow.style.display = 'flex';
	document.querySelector('.fogging').style.display = 'block';
}

// Открыть модальное окно для смены даты при переносе задачи из DONE в TO DO
function openModalChangeDateWindow() {
	modalChangeWindow.style.display = 'flex';
	document.querySelector('.fogging').style.display = 'block';

	let promiseModal = new Promise(function (resolve, reject) {
		modalChangeWindow.addEventListener('click', function (event) {
			if (event.target.classList.contains('button__confirm')) {
				if (changeDateInput.value === '') {
					changeDateInput.classList.add('empty-field');
				} else {
					resolve(toLocalDate(changeDateInput));
				}
			}
			if (event.target.classList.contains('button__cancel')) {
				reject();
			}
		});
	});
	return promiseModal;
}

// Закрыть модальное окно
function closeModalWindow(window) {
	window.style.display = 'none';
	document.querySelector('.fogging').style.display = 'none';
	if (window.classList.contains('modal-change-date')) changeDateForm.reset();
}
/*---------------------------------------------Events------------------------------*/
// Добавление задачи
addTaskButton.addEventListener('click', function () {
	let newTask = {
		task: addTaskInput,
		date: addTaskDateInput,
	}
	let check = isNoEmptyFields(newTask);
	if (check) {
		taskList.append(getTask());
		addTaskForm.reset();
	} else {
		document.querySelectorAll('input').forEach((item) => {
			if (item.value === '') {
				item.classList.add('empty-field');
				item.nextElementSibling.classList.add('empty-field-label');
			}
		});
	}
});

// Выделение незаполненного обязательного поля
document.querySelectorAll('.required-input').forEach(item => {
	item.addEventListener('blur', function (event) {
		if (!event.target.classList.contains('required-input')) {
			return;
		}
		if (event.target.value === '') {
			event.target.classList.add('empty-field');
			if(event.target.nextElementSibling) event.target.nextElementSibling.classList.add('empty-field-label');
		} else {
			event.target.classList.remove('empty-field');
			if(event.target.nextElementSibling) event.target.nextElementSibling.classList.remove('empty-field-label');
		}
	}, true);
});

// Удаление одной задачи либо всех задач из блока, вызов модального окна для подтверждения в блоке Doing
content.addEventListener('click', function(event) {
	if (!(event.target.classList.contains('delete-button') || event.target.classList.contains('close-icon'))) {
		return;
	} else if (event.target.closest('.board').classList.contains('doing-board')) {
		let deleteTask;
		let deleteAll;
		event.target.classList.contains('delete-button') ? deleteAll = true : deleteTask = true;
		if (event.target.closest('.board').querySelector('.list').children.length === 0) {
			return;
		} else {
			openModalConfirmWindow().then(function (resolve) {
				if (deleteAll) {
					event.target.previousElementSibling.innerHTML = '';
				} 
				if (deleteTask) event.target.closest('li').remove();
				closeModalWindow(modalConfirmWindow);
			}, function (reject) {
				closeModalWindow(modalConfirmWindow);
			});
		}
	} else {
		if (event.target.classList.contains('delete-button')) {
			event.target.previousElementSibling.innerHTML = '';
		} else {
			event.target.closest('li').remove();
		}
	}
});

// Перемещение задачи в следующий блок, ограничение на 5 задач в 'Doing', вызов модального окна для изменения даты.
// Если дата задания меньше текущей, она по умолчанию становится равна текущей
content.addEventListener('click', function (event) {
	if (!event.target.classList.contains('remove-icon')) {
		return;
	}
	let board = event.target.closest('.board');
	let task = event.target.closest('.task');
	if (board.classList.contains('todo-board') && board.parentElement.querySelector('.doing-list').children.length === 5) {
		openModalAlertWindow();
	} else if (board.classList.contains('done-board')) {
		openModalChangeDateWindow().then(function (resolve) {
			task.querySelector('.task__time').innerHTML = resolve;
			board.parentElement.querySelector('.todo-list').append(task);
			closeModalWindow(modalChangeWindow);
		}, function (reject) {
			if (!compareDate(task.querySelector('.task__time').innerHTML)) {
				let today = new Date().toISOString().split('T')[0].split('-').reverse().join('.');
				task.querySelector('.task__time').innerHTML = today;
			}
			closeModalWindow(modalChangeWindow);
			board.parentElement.querySelector('.todo-list').append(task);
		});
	} else {
		board.nextElementSibling.querySelector('.list').append(event.target.closest('.task'));
	}
});

// Закрытие модального окна с предупреждением о необходимости выполнить что-то, прежде чем добавлять шестую задачу
document.querySelector('.button__alert-confirm').addEventListener('click', function (event) {
	closeModalWindow(modalAlertWindow);
});
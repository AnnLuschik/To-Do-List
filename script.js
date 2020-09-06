const content = document.querySelector('.content');
const addTaskForm = document.forms.mainForm;
const addTaskInput = addTaskForm.elements.task;
const addTaskDateInput = addTaskForm.elements.date;
const addTaskButton = document.querySelector('.add-button');

const changeDateForm = document.forms.modalDateForm;
const changeDateInput = changeDateForm.elements.dateInput;

const modalConfirmWindow = document.querySelector('.modal-confirm');
const modalAlertWindow = document.querySelector('.modal-alert');
const modalChangeWindow = document.querySelector('.modal-change-date');

let todoList = localStorage.getItem('todo') ? JSON.parse(localStorage.getItem('todo')) : [];
let doingList = localStorage.getItem('doing') ? JSON.parse(localStorage.getItem('doing')) : [];
let doneList = localStorage.getItem('done') ? JSON.parse(localStorage.getItem('done')) : [];

let id = localStorage.getItem('id') ? +localStorage.getItem('id') : 0;

// localStorage.clear();

//Отрисовка хранящихся в LocalStorage задач
for (let item of todoList) {
	document.querySelector('.todo-list').append(getTask(item));
}

for (let item of doingList) {
	document.querySelector('.doing-list').append(getTask(item));
}

for (let item of doneList) {
	document.querySelector('.done-list').append(getTask(item));
}

// Установка минимальной даты в поле ввода
document.querySelectorAll('input[type=date]').forEach(item => {
	item.min = new Date().toISOString().split('T')[0];
});

// Перевод даты в формат dd.mm.yyyy
function toLocalDate(date) {
	let localDate = date.split('-');
	return localDate.reverse().join('.');
}

// Перевод даты в формат yyyy-mm-dd
function fromLocalDate(date) {
	let newDate = new Date();
	let currentDate = date.split('.');
	newDate.setFullYear(currentDate[2], currentDate[1] - 1, currentDate[0]);
	return newDate;
}

function fromLocalDateToString(date) {
	return date.toISOString().split('T')[0];
}

// Сравнение двух дат
function compareDate(date) {
	let today = new Date();
	let userDate = fromLocalDate(date);
	if(userDate >= today) {
		return true;
	} else {
		return false;
	}
}

// Проверка на пустые поля
function isNoEmptyFields(object) {
	for (let key in object) {
		if (object[key] === '') return false;
	}
	return true;
}

// Получение количества задач и запись в заголовок блока
function getTaskNumber(list) { 
	return list.children.length;
}

function createTaskNumber(title) {
	title.innerHTML = getTaskNumber(title.closest('.board').querySelector('.list'));
}

document.querySelectorAll('h2').forEach(item => createTaskNumber(item.firstElementChild));

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
function createTaskTimeElement(time) {
	let taskDate = document.createElement('p');
	taskDate.classList.add('task__time');
	taskDate.append(document.createTextNode(toLocalDate(time)));
	return taskDate;
}

function createTaskTextElement(text) {
	let taskText = document.createElement('p');
	taskText.classList.add('task__text');
	taskText.append(document.createTextNode(text));
	return taskText;
}

function createTextContainer(taskData) {
	let container = document.createElement('div');
	container.classList.add('text-container');
	container.append(createTaskTimeElement(taskData.date));
	container.append(createTaskTextElement(taskData.task));
	return container;
}

// Создать новую задачу
function getTask(taskData) {
	let task = document.createElement('li');
	task.classList.add('task');
	task.setAttribute('data-id', taskData.id);
	task.append(createTextContainer(taskData));
	task.append(createIconContainer());
	return task;
}

// Получить данные из задачи
function getTaskData(currentTask) {
	let taskData = {
		task: currentTask.firstElementChild.lastElementChild.innerHTML,
		date: fromLocalDateToString(fromLocalDate(currentTask.firstElementChild.firstElementChild.innerHTML)),
		id: currentTask.dataset.id,
	}
	return taskData;
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
					resolve(toLocalDate(changeDateInput.value));
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
	id++;
	localStorage.setItem('id', `${id}`);

	let newTask = {
		task: addTaskInput.value,
		date: addTaskDateInput.value,
		id: id,
	}

	let check = isNoEmptyFields(newTask);
	if (check) {
		todoList.push(newTask);
		addTaskListToStorage('todo', todoList);
		document.querySelector('.todo-list').append(getTask(newTask));
		addTaskForm.reset();
	} else {
		document.querySelectorAll('input').forEach((item) => {
			if (item.value === '') {
				item.classList.add('empty-field');
				item.nextElementSibling.classList.add('empty-field-label');
			}
		});
	}
	createTaskNumber(document.querySelector('.todo-board').querySelector('h2').firstElementChild);
});

function addTaskListToStorage(listName, taskList) {
	localStorage.setItem(`${listName}`, JSON.stringify(taskList));
}

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
	});
});

// Удаление одной задачи либо всех задач из блока, вызов модального окна для подтверждения в блоке Doing
content.addEventListener('click', function(event) {
	if (!(event.target.classList.contains('delete-button') || event.target.classList.contains('close-icon'))) {
		return;
	}
	let title = event.target.closest('.board').querySelector('h2').firstElementChild;
	event.target.classList.contains('delete-button') ? deleteList(event.target.parentElement.querySelector('.list')) : deleteTask(event.target.closest('.task'));
});

function deleteTask(task) {
	let title = task.closest('.board').querySelector('h2').firstElementChild;
	if(task.closest('.board').classList.contains('doing-board')){
		openModalConfirmWindow()
		.then(() => {
			task.remove();
			createTaskNumber(title);
			closeModalWindow(modalConfirmWindow);
			})
		.catch(() => {
			closeModalWindow(modalConfirmWindow);
		});
	} else {
		task.remove();
		createTaskNumber(title);
	}
}

function deleteList(list) {
	let title = list.closest('.board').querySelector('h2').firstElementChild;
	if(list.closest('.board').classList.contains('doing-board')) {
		openModalConfirmWindow()
		.then(() => {
			list.innerHTML = '';
			createTaskNumber(title);
			closeModalWindow(modalConfirmWindow);
			})
		.catch(() => {
			closeModalWindow(modalConfirmWindow);
		});
	} else {
		list.innerHTML = '';
		createTaskNumber(title);
	}
}

// Перемещение задачи в следующий блок, ограничение на 5 задач в 'Doing', вызов модального окна для изменения даты.
// Если дата задания меньше текущей, она по умолчанию становится равна текущей
content.addEventListener('click', function (event) {
	if (!event.target.classList.contains('remove-icon')) {
		return;
	}
	let board = event.target.closest('.board');
	let task = event.target.closest('.task');

	if(board.classList.contains('todo-board')) {
		if(content.querySelector('.doing-list').children.length === 5) {
			openModalAlertWindow();
		} else {
			removeTask(task, board);
			let currentTaskIndex = todoList.findIndex(item => {
				item.id === task.dataset.id;
			});
			todoList.splice(currentTaskIndex, 1);
			doingList.push(getTaskData(task));
			addTaskListToStorage('todo', todoList);
			addTaskListToStorage('doing', doingList);
		}
	} else if(board.classList.contains('done-board')) {
		openModalChangeDateWindow()
		.then(resolve => {
			removeTaskFromDoneAndChangeDate(resolve, task);
		})
		.catch(reject => {
			removeTaskFromDoneAndChangeDate(reject, task);	
		});
	} else {
		removeTask(task, board);
		let currentTaskIndex = doingList.findIndex(item => {
			item.id === task.dataset.id;
		});
		doingList.splice(currentTaskIndex, 1);
		doneList.push(getTaskData(task));
		addTaskListToStorage('doing', doingList);
		addTaskListToStorage('done', doneList);
	}
});

function removeTask(task, board) {
	board.nextElementSibling.querySelector('.list').append(task);
	createTaskNumber(board.querySelector('h2').firstElementChild);
	createTaskNumber(board.nextElementSibling.querySelector('h2').firstElementChild);
}

function removeTaskFromDoneAndChangeDate(result, task) {
	let todoBoardTitle = content.querySelector('.todo-board').querySelector('h2').firstElementChild;
	let currentBoardTitle = task.closest('.board').querySelector('h2').firstElementChild;
	if (!compareDate(task.querySelector('.task__time').innerHTML) && !result) {
		let today = new Date().toISOString().split('T')[0].split('-').reverse().join('.');
		task.querySelector('.task__time').innerHTML = today;
	} else if(result) {
		task.querySelector('.task__time').innerHTML = result;
	}
	content.querySelector('.todo-list').append(task);
	createTaskNumber(currentBoardTitle);
	createTaskNumber(todoBoardTitle);
	closeModalWindow(modalChangeWindow);
	let currentTaskIndex = doneList.findIndex(item => {
		item.id === task.dataset.id;
	});
	doneList.splice(currentTaskIndex, 1);
	todoList.push(getTaskData(task));
	addTaskListToStorage('todo', todoList);
	addTaskListToStorage('done', doneList);
}

// Закрытие модального окна с предупреждением о необходимости выполнить что-то, прежде чем добавлять шестую задачу
document.querySelector('.button__alert-confirm').addEventListener('click', function (event) {
	closeModalWindow(modalAlertWindow);
});
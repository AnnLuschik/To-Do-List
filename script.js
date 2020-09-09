import {getTask} from "./domService.js";
import {modalAlertWindow, modalChangeWindow, modalConfirmWindow} from "./modalService.js";
import {openModalAlertWindow, openModalChangeDateWindow, openModalConfirmWindow, closeModalWindow} from "./modalService.js";

const content = document.querySelector('.content');
const addTaskForm = document.forms.mainForm;
const addTaskInput = addTaskForm.elements.task;
const addTaskDateInput = addTaskForm.elements.date;
const addTaskButton = document.querySelector('.add-button');

let todoList = localStorage.getItem('todo') ? JSON.parse(localStorage.getItem('todo')) : [];
let doingList = localStorage.getItem('doing') ? JSON.parse(localStorage.getItem('doing')) : [];
let doneList = localStorage.getItem('done') ? JSON.parse(localStorage.getItem('done')) : [];

let id = localStorage.getItem('id') ? +localStorage.getItem('id') : 0;

//Сброс счётчика 
function resetCounter() {
	if(!todoList.length && !doingList.length && !doneList.length) {
		id = 0;
		localStorage.setItem('id', 0);
	}
}

resetCounter();

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

// Установка минимальной даты в поле ввода, корректировка по часовому поясу UTC+3
document.querySelectorAll('input[type=date]').forEach(item => {
	let hoursNow = new Date().getHours();
	let today = new Date();
	if(hoursNow < 3) {
		today.setHours(3);
	}
	item.min = today.toISOString().split('T')[0];
});

// Создание объекта Date из заголовка задачи, корректировка по часовому поясу UTC+3
function fromLocalDate(date) {
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

// Получить данные из задачи
function getTaskData(currentTask) {
	let taskData = {
		task: currentTask.firstElementChild.lastElementChild.innerHTML,
		date: fromLocalDateToString(fromLocalDate(currentTask.firstElementChild.firstElementChild.innerHTML)),
		id: currentTask.dataset.id,
	}
	return taskData;
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
	resetCounter();
});

function deleteTask(task) {
	let title = task.closest('.board').querySelector('h2').firstElementChild;
	if(task.closest('.board').classList.contains('doing-board')){
		openModalConfirmWindow()
		.then(() => {
			deleteTaskFromStorage(task, doingList);
			task.remove();
			createTaskNumber(title);
			closeModalWindow(modalConfirmWindow);	
			})
		.catch(() => {
			closeModalWindow(modalConfirmWindow);
		});
	} else {
		if(task.closest('.board').classList.contains('todo-board')) {
			deleteTaskFromStorage(task, todoList);
		} else {
			deleteTaskFromStorage(task, doneList);
		}
		task.remove();
		createTaskNumber(title);
	}
}

function deleteTaskFromStorage(task, taskList) {
	let currentTaskIndex = taskList.findIndex(item => item.id == task.dataset.id);
	taskList.splice(currentTaskIndex, 1);
	let key = getStorageKeyForList(taskList);
	addTaskListToStorage(key, taskList);
}

function deleteList(list) {
	if(list.children.length === 0) return;
	let title = list.closest('.board').querySelector('h2').firstElementChild;
	if(list.closest('.board').classList.contains('doing-board')) {
		openModalConfirmWindow()
		.then(() => {
			deleteListFromStorage(doingList);
			list.innerHTML = '';
			createTaskNumber(title);
			closeModalWindow(modalConfirmWindow);
			})
		.catch(() => {
			closeModalWindow(modalConfirmWindow);
		});
	} else if(list.closest('.board').classList.contains('todo-board')) {
		deleteListFromStorage(todoList);
		list.innerHTML = '';
		createTaskNumber(title);
	} else {
		deleteListFromStorage(doneList);
		list.innerHTML = '';
		createTaskNumber(title);
	}
}

function deleteListFromStorage(list) {
	list.length = 0;
	let key = getStorageKeyForList(list);
	addTaskListToStorage(key, list);
	resetCounter();
}

function getStorageKeyForList(list) {
	let storageKey;
	switch(list) {
		case todoList: 
			storageKey = 'todo';
			break;
		case doingList:
			storageKey = 'doing';
			break;
		case doneList:
			storageKey = 'done';
			break;
	}
	return storageKey;
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
			let currentTaskIndex = todoList.findIndex(item => item.id == task.dataset.id);
			todoList.splice(currentTaskIndex, 1);
			doingList.push(getTaskData(task));
			addTaskListToStorage('todo', todoList);
			addTaskListToStorage('doing', doingList);
			removeTask(task, board);
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
		let currentTaskIndex = doingList.findIndex(item => item.id == task.dataset.id);
		doingList.splice(currentTaskIndex, 1);
		doneList.push(getTaskData(task));
		addTaskListToStorage('doing', doingList);
		addTaskListToStorage('done', doneList);
		removeTask(task, board);
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
	let currentTaskIndex = doneList.findIndex(item => item.id == task.dataset.id)
	doneList.splice(currentTaskIndex, 1);
	todoList.push(getTaskData(task));
	addTaskListToStorage('todo', todoList);
	addTaskListToStorage('done', doneList);
}

// Закрытие модального окна с предупреждением о необходимости выполнить что-то, прежде чем добавлять шестую задачу
document.querySelector('.button__alert-confirm').addEventListener('click', function (event) {
	closeModalWindow(modalAlertWindow);
});
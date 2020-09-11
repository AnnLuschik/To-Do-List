import {getTask} from "./domService.js";
import {modalAlertWindow, modalChangeWindow, modalConfirmWindow} from "./modalService.js";
import {openModalAlertWindow, openModalChangeDateWindow, openModalConfirmWindow, closeModalWindow} from "./modalService.js";
import {compareDate, fromLocalDateToString, fromLocalDate} from "./dateUtilService.js";

const content = document.querySelector('.content');
const addTaskForm = document.forms.mainForm;
const addTaskInput = addTaskForm.elements.task;
const addTaskDateInput = addTaskForm.elements.date;
const addTaskButton = document.querySelector('.add-button');

const todoKey = 'todo';
const doingKey = 'doing';
const doneKey = 'done';

let todoList = localStorage.getItem(todoKey) ? JSON.parse(localStorage.getItem(todoKey)) : [];
let doingList = localStorage.getItem(doingKey) ? JSON.parse(localStorage.getItem(doingKey)) : [];
let doneList = localStorage.getItem(doneKey) ? JSON.parse(localStorage.getItem(doneKey)) : [];

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
		task: currentTask.querySelector('.task__text').innerHTML,
		date: fromLocalDateToString(fromLocalDate(currentTask.querySelector('.task__time').innerHTML)),
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
		addTaskListToStorage(todoKey, todoList);
		let taskElement = getTask(newTask);

		taskElement.addEventListener('click', function(event) {
			if(event.target.classList.contains('close-icon')) {
				deleteTask(event.target.closest('.task'));
				resetCounter();
			} else if(event.target.classList.contains('move-icon')) {
				moveTask(taskElement);
			}
		});

		document.querySelector('.todo-list').append(taskElement);
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

// Удаление задачи, всех задач из блока, вызов модального окна для подтверждения в блоке Doing
document.querySelectorAll('.delete-button').forEach(item => {
	item.addEventListener('click', function(event) {
		deleteList(event.target.parentElement.querySelector('.list'));
		resetCounter();
	});
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
	resetCounter();
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
			storageKey = todoKey;
			break;
		case doingList:
			storageKey = doingKey;
			break;
		case doneList:
			storageKey = doneKey;
			break;
	}
	return storageKey;
}

// Перемещение задачи в следующий блок, ограничение на 5 задач в 'Doing', вызов модального окна для изменения даты.
// Если дата задания меньше текущей, она по умолчанию становится равна текущей
function moveTask(task) {
	let board = task.closest('.board');

	if(board.classList.contains('todo-board')) {
		if(content.querySelector('.doing-list').children.length === 5) {
			openModalAlertWindow();
		} else {
			let currentTaskIndex = todoList.findIndex(item => item.id == task.dataset.id);
			todoList.splice(currentTaskIndex, 1);
			doingList.push(getTaskData(task));
			addTaskListToStorage(todoKey, todoList);
			addTaskListToStorage(doingKey, doingList);
			moveTaskToTheNextList(task, board);
		}

	} else if(board.classList.contains('done-board')) {
		openModalChangeDateWindow()
		.then(resolve => {
			moveTaskFromDoneAndChangeDate(resolve, task);
		})
		.catch(reject => {
			moveTaskFromDoneAndChangeDate(reject, task);	
		});
		
	} else {
		let currentTaskIndex = doingList.findIndex(item => item.id == task.dataset.id);
		doingList.splice(currentTaskIndex, 1);
		doneList.push(getTaskData(task));
		addTaskListToStorage(doingKey, doingList);
		addTaskListToStorage(doneKey, doneList);
		moveTaskToTheNextList(task, board);
	}
}

function moveTaskToTheNextList(task, board) {
	board.nextElementSibling.querySelector('.list').append(task);
	createTaskNumber(board.querySelector('h2').firstElementChild);
	createTaskNumber(board.nextElementSibling.querySelector('h2').firstElementChild);
}

function moveTaskFromDoneAndChangeDate(result, task) {
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
	addTaskListToStorage(todoKey, todoList);
	addTaskListToStorage(doneKey, doneList);
}

// Закрытие модального окна с предупреждением о необходимости выполнить что-то, прежде чем добавлять шестую задачу
document.querySelector('.button__alert-confirm').addEventListener('click', function (event) {
	closeModalWindow(modalAlertWindow);
});
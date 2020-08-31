let addTaskForm = document.forms.mainForm;
let addTaskInput = addTaskForm.elements.task;
let addTaskDateInput = addTaskForm.elements.date;
let addTaskButton = document.querySelector('.add-button');

let taskList = document.querySelector('.list');
let todoBoard = document.querySelector('.todo-board');

let modalConfirmWindow = document.querySelector('.modal-confirm');
let modalAlertWindow = document.querySelector('.modal-alert');

// Установка минимальной даты в поле ввода
document.querySelector('.date-input').min = new Date().toISOString().split('T')[0];

// Перевод даты в формат dd.mm.yyyy
function toLocalDate() {
	let localDate = addTaskDateInput.value.split('-');
	return localDate.reverse().join('.');
}

// Проверка на пустые поля
function getNoEmptyFields(object) {
	for(let key in object) {
		if (object[key].value === '') return false;
	}
	return true;
}

// Получение количества задач и запись в заголовок блока
function getTaskNumber(list) {
	let number = list.length;
	return number;
}

function createTaskNumber(title) {
	title.innerHTML = getTaskNumber(title.parentElement.nextElementSibling.children);
}

document.querySelectorAll('h2').forEach(item => createTaskNumber(item.firstElementChild));

let mutationObserver = new MutationObserver(mutationList => {
	mutationList.forEach(mutation => {
		if(mutation.target.tagName === 'UL') {
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
	taskDate.append(document.createTextNode(toLocalDate()));
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

// Открыть модальное окно
function openModalConfirmWindow() {
	modalConfirmWindow.style.display = 'flex';
	document.querySelector('.fogging').style.display = 'block';
	let promiseModal = new Promise(function(resolve, reject) {
		modalConfirmWindow.addEventListener('click', function(event) {
			if(event.target.classList.contains('button__confirm')) {
				resolve (true);
			} 
			if(event.target.classList.contains('button__cancel')) {
				reject (false);
			}
		});
	});
	return promiseModal;
}

function openModalAlertWindow() {
	modalAlertWindow.style.display = 'flex';
	document.querySelector('.fogging').style.display = 'block';
}
/*---------------------------------------------Events------------------------------*/
// Добавление задачи
addTaskButton.addEventListener('click', function() {
	let newTask = {
		task: addTaskInput,
		date: addTaskDateInput,
	}
	let check = getNoEmptyFields(newTask);
	if(check) {
		taskList.append(getTask());
		addTaskInput.value = '';
		addTaskDateInput.value = '';
	} else {
		document.querySelectorAll('input').forEach((item) => {
			if(item.value === '') {
				item.classList.add('empty-field');
				item.nextElementSibling.classList.add('empty-field-label');
			}
		});
	}
});

// Выделение незаполненного обязательного поля
document.addEventListener('blur', function(event) {
	if(event.target.tagName !== 'INPUT') {
		return;
	}
	if(event.target.value === '') {
		event.target.classList.add('empty-field');
		event.target.nextElementSibling.classList.add('empty-field-label');
	} else {
		event.target.classList.remove('empty-field');
		event.target.nextElementSibling.classList.remove('empty-field-label');
	}
}, true);

// Удаление одной задачи либо всех задач из блока, вызов модального окна для подтверждения в блоке Doing
document.addEventListener('click', function(event) {
	if(!(event.target.classList.contains('delete-button') || event.target.classList.contains('close-icon'))) {
		return;
	} else if (event.target.closest('.board').classList.contains('doing-board')) {
		let deleteTask;
		let deleteAll;
		event.target.classList.contains('delete-button') ? deleteAll = true : deleteTask = true;
		if(event.target.closest('.board').children[1].children.length === 0) {
			return; 
		} else {
			openModalConfirmWindow().then(function(resolve) {
				if(deleteAll) Array.from(event.target.previousElementSibling.children).forEach(item => item.remove());
				if(deleteTask) event.target.closest('li').remove();
				modalConfirmWindow.style.display = 'none';
				document.querySelector('.fogging').style.display = 'none';
			}, function(reject) {
				modalConfirmWindow.style.display = 'none';
				document.querySelector('.fogging').style.display = 'none';
			});
		}
	} else {
		if(event.target.classList.contains('delete-button')) {
			Array.from(event.target.previousElementSibling.children).forEach(item => item.remove());
		} else {
			event.target.closest('li').remove();
		}
	}
});

// Перемещение задачи в следующий блок, ограничение на 5 задач в 'Doing'
document.addEventListener('click', function() {
	if(!event.target.classList.contains('remove-icon')) {
		return;
	}
	let board = event.target.closest('.board');
	if(board.classList.contains('todo-board') && board.nextElementSibling.children[1].children.length === 5) {
		openModalAlertWindow();
	} else if(board.classList.contains('done-board')) {
		board.parentElement.firstElementChild.children[1].append(event.target.closest('.task'));
	} else {
		board.nextElementSibling.children[1].append(event.target.closest('.task'));
	}
});

document.querySelector('.button__alert-confirm').addEventListener('click', function(event) {
	event.target.closest('.modal').style.display = 'none';
});


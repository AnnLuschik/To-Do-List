let addTaskForm = document.forms.mainForm;
let addTaskInput = addTaskForm.elements.task;
let addTaskDateInput = addTaskForm.elements.date;
let addTaskButton = document.querySelector('.add-button');
let taskList = document.querySelector('.list');
let todoBoard = document.querySelector('.todo-board');
let modalWindow = document.querySelector('.modal');

/*-----------------------------------------Functions------------------------------------------*/
// Проверка на пустые поля
function getNoEmptyFields(object) {
	for(let key in object) {
		if (object[key] === '') return false;
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
	taskDate.append(document.createTextNode(addTaskDateInput.value));
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

// Добавить новую задачу
function getTask() {
	let task = document.createElement('li');
	task.classList.add('task');
	task.append(createTextContainer());
	task.append(createIconContainer());	
	return task;
}

// Открыть модальное окно
function openModalWindow() {
	modalWindow.style.display = 'flex';
	let promiseModal = new Promise(function(resolve, reject) {
		modalWindow.addEventListener('click', function(event) {
			if(event.target.classList.contains('button-container__confirm')) {
				resolve (true);
			} 
			if(event.target.classList.contains('button-container__cancel')) {
				reject (false);
			}
		});
	});
	return promiseModal;
}
/*---------------------------------------------Events------------------------------*/
// Добавление задачи
addTaskButton.addEventListener('click', function() {
	let newTask = {
		task: addTaskInput.value,
		date: addTaskDateInput.value,
	}

	let check = getNoEmptyFields(newTask);
	
	if(check) {
		taskList.append(getTask());
		addTaskInput.value = '';
		addTaskDateInput.value = '';
	} else alert('All fields must be filled out');
});

// Удаление одной задачи либо всех задач из блока, вызов модального окна для подтверждения в блоке Doing
document.addEventListener('click', function(event) {
	if(!(event.target.classList.contains('delete-button') || event.target.classList.contains('close-icon'))) {
		return false;
	} else if (event.target.closest('.board').classList.contains('doing-board')) {
		let deleteTask;
		let deleteAll;
		event.target.classList.contains('delete-button') ? deleteAll = true : deleteTask = true;
		if(event.target.closest('.board').children[1].children.length === 0) {
			return false; 
		} else {
			openModalWindow().then(function(resolve) {
				if(deleteAll) Array.from(event.target.previousElementSibling.children).forEach(item => item.remove());
				if(deleteTask) event.target.closest('li').remove();
				modalWindow.style.display = 'none';
			}, function(reject) {
				modalWindow.style.display = 'none';
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
		return false;
	}
	let board = event.target.closest('.board');
	if(board.classList.contains('todo-board') && board.nextElementSibling.children[1].children.length === 5) {
		alert(`Doing board cannot contain more than 5 tasks`);
	} else if(board.classList.contains('done-board')) {
		board.parentElement.firstElementChild.children[1].append(event.target.closest('.task'));
	} else {
		board.nextElementSibling.children[1].append(event.target.closest('.task'));
	}
});
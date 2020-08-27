let addTaskForm = document.forms.mainForm;
let addTaskInput = addTaskForm.elements.task;
let addTaskDateInput = addTaskForm.elements.date;
let addTaskButton = document.querySelector('.add-button');
let taskList = document.querySelector('.list');
let todoBoard = document.querySelector('.todo-board');

/*-----------------------------------------Functions------------------------------------------*/
// Check empty fields
function getNoEmptyFields(object) {
	for(let key in object) {
		if (object[key] === '') return false;
	}
	return true;
}

// Get number of tasks and overwrite to the title of the board
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

// Create 'delete' and 'remove' icons
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

// Create text part of new task
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

// Add new task 
function getTask() {
	let task = document.createElement('li');
	task.classList.add('task');
	task.append(createTextContainer());
	task.append(createIconContainer());	
	return task;
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

// Удаление задачи
document.body.addEventListener('click', function(event) {
	if(!event.target.classList.contains('close-icon')) {
		return false;
	}
	event.target.closest('li').remove();
});	

// Удаление всех задач из блока
document.body.addEventListener('click', function(event) {
	if(!event.target.classList.contains('delete-button')) {
		return false;
	}
	Array.from(event.target.previousElementSibling.children).forEach(item => item.remove());
});

// Перемещение задачи в следующий блок, ограничение на 5 задач в 'Doing'	
document.body.addEventListener('click', function() {
	if(!event.target.classList.contains('remove-icon')) {
		return false;
	}
	let board = event.target.closest('.board');
	if(board.classList.contains('todo-board') && board.nextElementSibling.children[1].children.length === 5) {
		alert(`Doing board cannot contain more than 5 tasks`);
	} else {
		board.nextElementSibling.children[1].append(event.target.closest('.task'));
		if(event.target.closest('.board').classList.contains('done-board')) event.target.remove();
	}
});


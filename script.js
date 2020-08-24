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




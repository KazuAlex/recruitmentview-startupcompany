 let _modPath;

let recruitmentViewObject = undefined;

let renderFunction = () => {
	$('.recruitmentView').remove();
	
	let recruitment = getActiveRecruitment();
	let candidates = getCandidates();
	let recruitmentHTML = getActiveRecruitmentView(recruitment, candidates);

	recruitmentViewObject = $('<products-overlay></products-overlay>')
		.attr('class', 'recruitmentView')
		.attr('style', 'left: 20px; right: auto;')
		.html(
			$('<div></div>').html(recruitmentHTML)
		);
	$('ui')
		.append(recruitmentViewObject);


	$('button[name="removeCandidate"]').click((item) => {
		let id = $(item.currentTarget).attr('data-id');

		_.remove(GetRootScope().settings.candidates, (c) => {return c.id === id;});
		GetRootScope().$broadcast(GameEvents.CandidateChange);
	});

	$('button[name="hireCandidate"]').click((item) => {
		let id = $(item.currentTarget).attr('data-id');

		let candidate = _.find(getCandidates(), (c) => c.id === id);

		candidate.hired = GetRootScope().settings.date;
		_.remove(GetRootScope().settings.candidates, (c) => {return c.id === id;});

		GetRootScope().settings.unassignedEmployees.push(candidate);
		Game.Lifecycle._loadEmployeeSchedules();
		GetRootScope().$broadcast(GameEvents.EmployeeChange);
		GetRootScope().$broadcast(GameEvents.CandidateChange);
		PlaySound(Sounds.stamp);
	});

}

let getCandidates = () => {
	let candidates = GetRootScope().settings.candidates;

	return candidates;
}


let getActiveRecruitment = () => {

	let activeRecruitment = GetRootScope().settings.activeRecruitment;
	if (activeRecruitment != undefined)
		activeRecruitment.hoursLeft = Math.round((activeRecruitment.totalMinutes - activeRecruitment.completedMinutes) / 60);
	
	return activeRecruitment;
}

let getActiveRecruitmentView = (recruitment, candidates) => {
	if (recruitment == undefined)
		return '';
	if (candidates == undefined)
		candidates = [];
	let recruitmentHoursLeft = Helpers.GetLocalized('x_hours', {'hours': recruitment.hoursLeft});
	let candidatesHTML = getCandidatesView(candidates);

	return `
		<div class="product" data-id="recruitment-sidebar" style="position: relative; display:flex; flex-direction:column; width:250px">
			<i class="itemCorner fa fa-users"></i>
			<b>${recruitment.employeeType.title}</b>
			<span>${recruitment.level}</span>
			<div>
				${candidatesHTML.join('')}
			</div>
			<span class="dimmed small">${recruitmentHoursLeft}</span>
		</div>
	`;
}

let getCandidatesView = (candidates) => {
	candidatesHTML = [];

	_.forIn(candidates, (candidate) => {
		candidatesHTML.push(getCandidateView(candidate));
	});

	return candidatesHTML;
}

let getCandidateView = (candidate) => {

	let avatarPath = '3dmodels/people/'+ candidate.avatar +'.png';
	let candidateStarLevelClass = '';
	if (candidate.level == EmployeeLevels.Beginner)
		candidateStarLevelClass = 'fa-star-o';
	else if (candidate.level == EmployeeLevels.Intermediate)
		candidateStarLevelClass = 'fa-star-half';
	else if (candidate.level == EmployeeLevels.Intermediate)
		candidateStarLevelClass = 'fa-star';
	let requiredHigherWer = Helpers.CalculateWer().total < candidate.requiredWer;
	let requiredWerMessage = "";
	if (requiredHigherWer)
		requiredWerMessage = 'disabled tooltip-enable="true" tooltip-append-to-body="true" uib-tooltip="'+ Helpers.GetLocalized('higher_wer_required') +'"';

	return `
		<div style="display: flex; flex-direction: column">
			<div style="display: flex; flex-direction: row; justify-content: space-between; align-items: center;">
				<div class="avatar-image" style="margin: 0; width: 45px; height: 45px; background-image: url('${avatarPath}'); background-size: 400px;"></div>
				<span>${candidate.name}</span>
				<span><i class="fa ${candidateStarLevelClass}"></i> ${candidate.speed}%</span>
			</div>
			<div style="display: flex; flex-direction: row; justify-content: space-between; align-items: center;">
				<span>$${candidate.salary.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}</span>
				<button name="removeCandidate" class="red small" data-id="${candidate.id}">
					<i class="fa fa-times"></i>
				</button>
				<button
					name="hireCandidate"
					class="blue small ${requiredHigherWer ? 'disabled' : ''}"
					data-id="${candidate.id}"
					${requiredWerMessage}

				>
					${Helpers.GetLocalized('hire')}
				</button>
			</div>
		</div>
	`;
}

Restart = () => {
	Remote.app.relaunch();
	Remote.app.exit();
}

exports.initialize = modPath => {};
exports.onLoadGame = settings => {

	GetRootScope().$on(GameEvents.CandidateChange, renderFunction);
	
	renderFunction();
	
};
exports.onNewHour = settings => {};
exports.onNewDay = settings => {};
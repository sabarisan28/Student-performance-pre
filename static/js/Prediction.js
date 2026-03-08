const students = [];
const addBtn = document.getElementById('addStudentBtn');
const form = document.getElementById('scoreForm');

addBtn.addEventListener('click', addStudent);

// Show message box
function showMessage(msg){
    const box = document.getElementById('messageBox');
    box.textContent = msg;
    box.classList.add('show');
    setTimeout(()=> box.classList.remove('show'), 3000);
}

function addStudent(){
    const name = document.getElementById('studentName').value.trim();
    const id = document.getElementById('studentID').value.trim();
    if(!name){ showMessage("🛑 Please enter the student's name."); return; }

    const subjects = [
        { name: "BCU", t1: "BCU", t2: null },
        { name: "English for IT", t1: "EngIT_T1", t2: "EngIT_T2" },
        { name: "General English", t1: "GenEng_T1", t2: "GenEng_T2" },
        { name: "Logic", t1: "Logic", t2: null },
        { name: "PL", t1: "PL_T1", t2: "PL_T2" },
        { name: "Design", t1: "Design", t2: null },
        { name: "Algorithm", t1: null, t2: "Algorithm" },
        { name: "Web Design", t1: null, t2: "WebDesign" }
    ];

    const studentData = { name, id, subjects: [], overallTotal:0, overallCount:0, t1Total:0, t1Count:0, t2Total:0, t2Count:0, lowestScore:101, lowestSubject:"N/A" };

    subjects.forEach(sub=>{
        const t1Score = sub.t1 ? parseFloat(document.getElementById(sub.t1).value) : null;
        const t2Score = sub.t2 ? parseFloat(document.getElementById(sub.t2).value) : null;
        let comment="No Data", commentClass="same";

        if(t1Score!=null && !isNaN(t1Score) && t2Score!=null && !isNaN(t2Score)){
            if(t2Score>t1Score){ comment=`✅ Better (+${(t2Score-t1Score).toFixed(0)} points)`; commentClass="good"; }
            else if(t2Score<t1Score){ comment=`⚠️ Needs Improvement (-${(t1Score-t2Score).toFixed(0)} points)`; commentClass="needs"; }
            else { comment="↔️ Same as Term 1"; commentClass="same"; }
        } else if((t1Score==null || isNaN(t1Score)) && (t2Score!=null && !isNaN(t2Score))){ comment="✨ New subject this term"; commentClass="new-subject"; }

        if(t1Score!=null && !isNaN(t1Score)){ studentData.overallTotal+=t1Score; studentData.overallCount++; studentData.t1Total+=t1Score; studentData.t1Count++; if(t1Score<studentData.lowestScore){ studentData.lowestScore=t1Score; studentData.lowestSubject=`${sub.name} (Term 1)`; } }
        if(t2Score!=null && !isNaN(t2Score)){ studentData.overallTotal+=t2Score; studentData.overallCount++; studentData.t2Total+=t2Score; studentData.t2Count++; if(t2Score<studentData.lowestScore){ studentData.lowestScore=t2Score; studentData.lowestSubject=`${sub.name} (Term 2)`; } }

        studentData.subjects.push({ ...sub, t1Score, t2Score, comment, commentClass });
    });

    studentData.overallAverage = studentData.overallCount>0 ? studentData.overallTotal/studentData.overallCount : 0;
    studentData.t1Average = studentData.t1Count>0 ? studentData.t1Total/studentData.t1Count : 0;
    studentData.t2Average = studentData.t2Count>0 ? studentData.t2Total/studentData.t2Count : 0;

    let overallComment, overallClass="needs";
    if(studentData.overallCount===0){ overallComment="No scores entered."; overallClass="same"; }
    else if(studentData.overallAverage>=90){ overallComment=`🏆 EXCELLENT! Avg ${studentData.overallAverage.toFixed(2)}%`; overallClass="good"; }
    else if(studentData.overallAverage>=75){ overallComment=`👍 Strong performance Avg ${studentData.overallAverage.toFixed(2)}%`; overallClass="good"; }
    else { overallComment=`⚠️ Requires Focus Avg ${studentData.overallAverage.toFixed(2)}% on ${studentData.lowestSubject}`; overallClass="needs"; }

    studentData.overallComment = overallComment;
    studentData.overallClass = overallClass;

    students.push(studentData);
    renderTable();
    form.reset();
}

function renderTable(){
    const tbody = document.querySelector("#resultTable tbody");
    tbody.innerHTML="";
    const frag = document.createDocumentFragment();

    students.forEach(student=>{
        student.subjects.forEach(sub=>{
            const row = document.createElement('tr');
            row.innerHTML=`<td>${student.name}</td><td>${student.id||"-"}</td><td>${sub.name}</td><td style="text-align:center;">${sub.t1Score!=null?sub.t1Score.toFixed(0):"-"}</td><td style="text-align:center;">${sub.t2Score!=null?sub.t2Score.toFixed(0):"-"}</td><td class="${sub.commentClass}">${sub.comment}</td>`;
            frag.appendChild(row);
        });
        const summaryRow = document.createElement('tr');
        summaryRow.classList.add('summary-row');
        const t1Max = student.t1Count*100, t2Max=student.t2Count*100;
        summaryRow.innerHTML=`<td colspan="2" style="font-weight:700;text-align:center;">Term 1 Total: ${student.t1Total.toFixed(0)}/${t1Max}<br>Avg: ${student.t1Average.toFixed(2)}%</td><td colspan="2" style="font-weight:700;text-align:center;">Term 2 Total: ${student.t2Total.toFixed(0)}/${t2Max}<br>Avg: ${student.t2Average.toFixed(2)}%</td><td colspan="2" class="${student.overallClass}">${student.overallComment}</td>`;
        frag.appendChild(summaryRow);
        const separator = document.createElement('tr'); separator.innerHTML=`<td colspan="6"></td>`; separator.style.height='20px'; separator.style.background='#f4f7f9'; frag.appendChild(separator);
    });

    tbody.appendChild(frag);
}

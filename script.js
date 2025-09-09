let sessions = JSON.parse(localStorage.getItem("sessions")) || [];
let subjects = JSON.parse(localStorage.getItem("subjects")) || [];
let students = JSON.parse(localStorage.getItem("students")) || [];
let lastDeletedItem = null;  // ✅ Track last deleted item for undo
function deleteItem() {
    let itemType = prompt("Enter what to delete: (session/subject/student)");
    if (!itemType) return;

    itemType = itemType.toLowerCase();
    let itemToDelete = prompt(`Enter the ${itemType} name/code/email to delete:`);

    if (!itemToDelete) return;

    if (itemType === "session") {
        let index = sessions.indexOf(itemToDelete);
        if (index === -1) {
            alert("❌ Session not found!");
            return;
        }
        lastDeletedItem = { type: "session", value: itemToDelete };
        sessions.splice(index, 1);
        localStorage.setItem("sessions", JSON.stringify(sessions));
    } 
    else if (itemType === "subject") {
        let index = subjects.indexOf(itemToDelete);
        if (index === -1) {
            alert("❌ Subject not found!");
            return;
        }
        lastDeletedItem = { type: "subject", value: itemToDelete };
        subjects.splice(index, 1);
        localStorage.setItem("subjects", JSON.stringify(subjects));
    } 
    else if (itemType === "student") {
        let studentIndex = students.findIndex(s => s.email === itemToDelete);
        if (studentIndex === -1) {
            alert("❌ Student not found!");
            return;
        }
        lastDeletedItem = { type: "student", value: students[studentIndex] };
        students.splice(studentIndex, 1);
        localStorage.setItem("students", JSON.stringify(students));
    } 
    else {
        alert("❌ Invalid type! Choose session/subject/student.");
        return;
    }

    alert(`✅ ${itemType} "${itemToDelete}" deleted successfully!`);
}


function passwordLogin() {
    let username = document.getElementById("username")?.value.trim();
    let password = document.getElementById("password")?.value.trim();

    if (!username || !password) {
        alert("⚠️ Please enter both username and password.");
        return;
    }

    fetch("http://127.0.0.1:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.user) {
            localStorage.setItem("loggedInUser", data.user);
            sessionStorage.setItem("sessionActive", "true");
            window.location.href = "/index";
        } else {
            let msg = document.getElementById("loginMessage");
            msg.innerText = "❌ Invalid username or password!";
            msg.style.color = "red";
        }
    })
    .catch(error => {
        console.error("Login error:", error);
        alert("❌ Error logging in. Please try again.");
    });
}

function logout() {
    fetch("http://127.0.0.1:5000/api/logout", { method: "GET" })
    .then(() => {
        localStorage.removeItem("loggedInUser");
        sessionStorage.removeItem("sessionActive");
        window.location.href = "/login";
    })
    .catch(error => console.error("Logout error:", error));
}

document.addEventListener("DOMContentLoaded", () => {
    let loggedInUser = localStorage.getItem("loggedInUser");
    let sessionActive = sessionStorage.getItem("sessionActive");

    if (!loggedInUser || !sessionActive) {
        if (window.location.pathname !== "/login") {
            window.location.href = "/login";
        }
    }

    document.getElementById("loginBtn")?.addEventListener("click", passwordLogin);
    document.getElementById("logoutBtn")?.addEventListener("click", logout);
    document.getElementById("addSessionBtn")?.addEventListener("click", addSession);
    document.getElementById("addSubjectBtn")?.addEventListener("click", addSubject);
    document.getElementById("addStudentBtn")?.addEventListener("click", addStudent);
    document.getElementById("saveAttendanceBtn")?.addEventListener("click", saveAttendance);
    document.getElementById("showRecordsBtn")?.addEventListener("click", showRecords);
    document.getElementById("deleteBtn")?.addEventListener("click", deleteItem);

    // ✅ Face Recognition Buttons
    document.getElementById("startCamBtn")?.addEventListener("click", startWebcam);
    document.getElementById("captureBtn")?.addEventListener("click", captureFace);
    document.getElementById("faceLoginBtn")?.addEventListener("click", faceLogin);
});

function addSession() {
    let sessionName = prompt("Enter the new session name:");
    if (!sessionName || sessions.includes(sessionName)) {
        alert("⚠️ Session already exists or input invalid!");
        return;
    }

    sessions.push(sessionName);
    localStorage.setItem("sessions", JSON.stringify(sessions));

    let sessionDropdown = document.getElementById("session");
    let newOption = document.createElement("option");
    newOption.textContent = sessionName;
    sessionDropdown.appendChild(newOption);

    alert(`✅ Session "${sessionName}" added successfully!`);
}

function addSubject() {
    let subjectCode = prompt("Enter the subject code (e.g., CS101):");
    if (!subjectCode || subjects.includes(subjectCode)) {
        alert("⚠️ Subject already exists or input invalid!");
        return;
    }

    subjects.push(subjectCode);
    localStorage.setItem("subjects", JSON.stringify(subjects));

    let container = document.querySelector(".course-buttons");
    if (!document.getElementById(`btn${subjectCode}`)) {
        let newButton = document.createElement("button");
        newButton.className = "course-btn";
        newButton.id = `btn${subjectCode}`;
        newButton.textContent = subjectCode;
        newButton.addEventListener("click", () => {
            console.log("Loading course:", subjectCode);
            loadCourse(subjectCode);
        });
        container.appendChild(newButton);
    }

    alert(`✅ Subject "${subjectCode}" added successfully!`);
}

function loadCourse(courseCode) {
    if (!courseCode) {
        alert("⚠️ Invalid course code!");
        return;
    }

    document.getElementById("course-title").innerText = `Course: ${courseCode}`;
    let table = document.getElementById("studentTableBody");
    table.innerHTML = "";

    fetch(`http://127.0.0.1:5000/api/attendance/${encodeURIComponent(courseCode)}`)
    .then(response => {
        if (!response.ok) throw new Error("No attendance found, loading stored students...");
        return response.json();
    })
    .then(data => {
        data.data.forEach((record, index) => {
            let row = table.insertRow();
            row.insertCell(0).innerText = index + 1;
            row.insertCell(1).innerText = record.student_id;
            row.insertCell(2).innerText = record.status;
            row.insertCell(3).innerHTML = `<input type="checkbox" class="attendance-checkbox" id="chk-${record.student_id}" ${record.status === "Present" ? "checked" : ""}>`;
        });
    })
    .catch(() => {
        let filtered = students.filter(s => s.subject === courseCode);
        filtered.forEach((student, index) => {
            let row = table.insertRow();
            row.insertCell(0).innerText = index + 1;
            row.insertCell(1).innerText = student.email;
            row.insertCell(2).innerText = "Not Marked";
            row.insertCell(3).innerHTML = `<input type="checkbox" class="attendance-checkbox" id="chk-${student.email}">`;
        });
    });
}

function addStudent() {
    let titleElement = document.getElementById("course-title");
    if (!titleElement || !titleElement.innerText.includes(": ")) {
        alert("⚠️ Please select a course first!");
        return;
    }

    let courseCode = titleElement.innerText.split(": ")[1];
    let studentName = prompt("Enter the student's name:");
    if (!studentName) return;

    let studentEmail = studentName.toLowerCase().replace(/\s/g, "") + "@example.com";

    fetch("http://127.0.0.1:5000/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            student_name: studentName,
            email: studentEmail,
            phone: "0000000000",             // Required, even if dummy
            course: courseCode,              // Match backend key
            session_id: 1                    // Optional, defaults to 1
        })
    })
    
    
    .then(res => res.json())
    .then(data => {
        if (data.message) {
            students.push({ name: studentName, email: studentEmail, subject: courseCode });
            localStorage.setItem("students", JSON.stringify(students));
            alert(`✅ Student "${studentName}" added successfully!`);
            loadCourse(courseCode);
        } else {
            alert("❌ Failed to add student.");
        }
    })
    .catch(error => {
        console.error("Error adding student:", error);
        alert("❌ Error connecting to server.");
    });
}

function saveAttendance() {
    let titleElement = document.getElementById("course-title");
    if (!titleElement || !titleElement.innerText.includes(": ")) {
        alert("⚠️ Please select a course first!");
        return;
    }

    let courseCode = titleElement.innerText.split(": ")[1];
    let attendanceDate = document.getElementById("attendanceDate").value;

    if (!attendanceDate) {
        alert("⚠️ Please select a date!");
        return;
    }

    if (!confirm(`✅ Confirm saving attendance for ${attendanceDate}?`)) return;

    let checkboxes = document.querySelectorAll(".attendance-checkbox");
    checkboxes.forEach((checkbox) => {
        let id = checkbox.id.replace("chk-", "");
        let status = checkbox.checked ? "Present" : "Absent";

        if (!isNaN(id)) {
            postAttendance({ student_id: id, subject_code: courseCode, date: attendanceDate, status });
        } else {
            fetch("http://127.0.0.1:5000/api/students_by_email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: id })
            })
            .then(res => res.json())
            .then(data => {
                if (data.student_id) {
                    postAttendance({ student_id: data.student_id, subject_code: courseCode, date: attendanceDate, status });
                } else {
                    alert(`❌ Student not found for email: ${id}`);
                }
            })
            .catch(err => {
                console.error("❌ Error fetching student ID:", err);
                alert("❌ Failed to get student ID.");
            });
        }
    });

    alert("✅ Attendance save requests sent!");
}

function postAttendance(record) {
    fetch("http://127.0.0.1:5000/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record)
    })
    .then(res => res.json())
    .then(data => console.log("✅ Saved:", data))
    .catch(err => {
        console.error("❌ Save failed:", err);
        alert("❌ Attendance save error.");
    });
}

// ✅ Webcam Integration for Face Login
let webcamStream = null;

function startWebcam() {
    navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        webcamStream = stream;
        document.getElementById("webcam").srcObject = stream;
    })
    .catch(err => {
        console.error("Webcam error:", err);
        alert("❌ Unable to access webcam.");
    });
}

function captureFace() {
    let video = document.getElementById("webcam");
    let canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    let imageData = canvas.toDataURL("image/png");

    let username = prompt("Enter username for face registration:");
    if (!username) return;

    fetch("http://127.0.0.1:5000/api/register_face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, image: imageData })
    })
    .then(res => res.json())
    .then(data => alert(data.message || "✅ Face registered!"))
    .catch(err => console.error("❌ Face register error:", err));
}

function faceLogin() {
    let video = document.getElementById("webcam");
    let canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    let imageData = canvas.toDataURL("image/png");

    fetch("http://127.0.0.1:5000/api/face_login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData })
    })
    .then(res => res.json())
    .then(data => {
        if (data.user) {
            localStorage.setItem("loggedInUser", data.user);
            sessionStorage.setItem("sessionActive", "true");
            window.location.href = "/index";
        } else {
            alert(data.message || "❌ Face login failed.");
        }
    })
    .catch(err => {
        console.error("❌ Face login error:", err);
        alert("❌ Face login error.");
    });
}

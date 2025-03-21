
const questions = {
    q1: "Overall Satisfaction",
    q2: "Quality of Work",
    q3: "Timeliness",
    q4: "Communication",
    q5: "Responsiveness",
    q6: "Technical Expertise",
    q7: "Problem-solving",
    q8: "Change Management",
};

let allResponses = [];
let projects = [];


async function fetchResponses() {
    const res = await fetch('https://getallcustomerresponses-dcwslcbviq-uc.a.run.app');
    return res.json();
}

 async function fetchProjects() {
    const res = await fetch('https://getallprojects-dcwslcbviq-uc.a.run.app');
    return res.json();
}

async function fetchData(url) {
    const res = await fetch(url);
    return res.json();
}

function parseDate(inputDate) {
    const [datePart] = inputDate.split(',');
    const [day, month, year] = datePart.trim().split('/');
    return new Date(`${year}-${month}-${day}`);
}

function loadNPSIcons(promoterPercentage, detractorPercentage, neutralPercentage) {
    const iconContainer = document.getElementById('nps-icons');
    iconContainer.innerHTML = '';

    const totalIcons = 10;
    const promoterCount = Math.round((promoterPercentage / 100) * totalIcons);
    const neutralCount = Math.round((neutralPercentage / 100) * totalIcons);
    const detractorCount = Math.round((detractorPercentage / 100) * totalIcons);

    for (let i = 0; i < totalIcons; i++) {
        const icon = document.createElement('i');
        icon.className = 'bx bx-male';
        icon.style.fontSize = '24px';

        if (i < promoterCount) {
            icon.style.color = 'green'; // Promoters (9-10)
        } else if (i < promoterCount + neutralCount) {
            icon.style.color = 'yellow'; // Neutrals (7-8)
        } else {
            icon.style.color = 'red'; // Detractors (1-6)
        }

        iconContainer.appendChild(icon);
    }
}

function calculateCustomerSatisfaction(responses) {
    const total = responses.length;
    if (!total) return 0;

    const avg = responses.reduce((sum, r) => sum + parseFloat(r.q11), 0) / total;
    return (avg * 10).toFixed(1);
}

function displayStars(percentage) {
    const fullStars = Math.floor(percentage / 20);
    const halfStar = percentage % 20 >= 10 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;

    return '<i class="bx bxs-star" style="color: gold; font-size:100px;"></i>'.repeat(fullStars) +
        '<i class="bx bxs-star-half" style="color: gold; font-size:100px;"></i>'.repeat(halfStar) +
        '<i class="bx bx-star" style="color: gold; font-size:100px;"></i>'.repeat(emptyStars);
}

function calculateTimelyCompletion(projects) {
    const total = projects.length;
    const completedOnTime = projects.filter(p => p.on_time === "Yes").length;
    return total ? ((completedOnTime / total) * 100).toFixed(1) : 0;
}

function getDelayedProjects(projects) {
    return projects.filter(p => p.on_time === "No").slice(-4);
}

function loadKPIs(responses, projects) {
    const totalSurveys = responses.length;
    const avgDuration = (
        responses.reduce((sum, r) => sum + parseFloat(r.time_duration), 0) / totalSurveys
    ).toFixed(2);

    const promoters = responses.filter((r) => r.q11 >= 9).length;
    const neutrals = responses.filter((r) => r.q11 > 6 && r.q11 < 9).length;
    const detractors = responses.filter((r) => r.q11 <= 6).length;

    const totalValid = promoters + detractors+ neutrals;
    const promoterPercentage = totalValid ? ((promoters / totalValid) * 100).toFixed(1) : 0;
    const detractorPercentage = totalValid ? ((detractors / totalValid) * 100).toFixed(1) : 0;
    const neutralPercentage = totalValid ? ((neutrals / totalValid) * 100).toFixed(1) : 0;
    const nps = promoterPercentage - detractorPercentage;

    const totalProjects = projects.length;
    const projectsWithRevisions = projects.filter((p) => p.revisions > 0).length;
    const projectsWithoutRevisions = totalProjects - projectsWithRevisions;
    const projectsWithoutRevisionsPercentage = (projectsWithoutRevisions / totalProjects) * 100;

    document.getElementById('project-quality').textContent = `${projectsWithoutRevisionsPercentage.toFixed(1)}%`;
    document.getElementById('promoters').textContent = `${promoterPercentage}%`;
    document.getElementById('neutrals').textContent = `${neutralPercentage}%`;
    document.getElementById('detractors').textContent = `${detractorPercentage}%`;
    document.getElementById('nps-score').textContent = nps;

    loadNPSIcons(promoterPercentage, detractorPercentage, neutralPercentage);
}

async function loadNewCharts(responses, projects) {
    const qualityData = {
        labels: ["Without revisions", "With revisions"],
        datasets: [{
            label: "Project Quality",
            data: [
                projects.filter(p => p.revisions === "0").length,
                projects.filter(p => p.revisions > "0").length
            ],
            backgroundColor: ["#28a745", "#dc3545"],
            borderRadius: 10
        }]
    };

    new Chart(document.getElementById("project-quality-chart"), {
        type: "bar",
        data: qualityData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: { display: true, text: "Project Quality", font: { family: "Poppins", weight: "bold", size: 18}, align: "start"}
            },
            scales: {
                x: { ticks: { font: { family: "Poppins" } } },
                y: { ticks: { font: { family: "Poppins" } } }
            }
        }


    });

    const promoters = responses.filter(r => r.q11 >= 9).length;
    const detractors = responses.filter(r => r.q11 <= 6).length;
    const neutrals = responses.length - (promoters + detractors);
    const npsData = {
        labels: ["Promoters", "Neutrals", "Detractors"],
        datasets: [{
            label: "NPS",
            data: [promoters, neutrals, detractors],
            backgroundColor: ["#28a745", "#ffc107", "#dc3545"]
        }]
    };

    new Chart(document.getElementById("nps-chart"), {
        type: "doughnut",
        data: npsData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true },
                title: { display: true, text: "Net Promoter Score (NPS)" , font: { family: "Poppins", weight: "bold", size: 18}, align: "start"}
            }
        }

    });

    const dates = projects.map(p => parseDate(p.finish_date));
    const dateCounts = dates.reduce((acc, date) => {
        const key = date.toISOString().split("T")[0];
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});
    const timelineData = {
        labels: Object.keys(dateCounts),
        datasets: [{
            label: "Proyectos Completados",
            data: Object.values(dateCounts),
            borderColor: "#007bff",
            backgroundColor: "rgba(0, 123, 255, 0.5)",
            fill: true
        }]
    };

}
async function loadAdditionalCharts() {
    const [resourceData, clientRetentionData, valueAddData, budgetData] = await Promise.all([
        fetchData('https://getresourceutilization-dcwslcbviq-uc.a.run.app'),
        fetchData('https://getclientretention-dcwslcbviq-uc.a.run.app'),
        fetchData('https://getvalueadd-dcwslcbviq-uc.a.run.app'),
        fetchData('https://getbudgetadherence-dcwslcbviq-uc.a.run.app')
    ]);

    // 🔹 Procesamiento de Resource Utilization
    const totalBillableHours = resourceData.reduce((sum, item) => sum + Number(item.billable_hours), 0);
    const totalHours = resourceData.reduce((sum, item) => sum + Number(item.total_hours), 0);
    const resourceUtilization = totalHours > 0 ? (totalBillableHours / totalHours) * 100 : 0;

    // 🔹 Procesamiento de Client Retention
    const totalRepClients = clientRetentionData.reduce((sum, item) => sum + Number(item.rep_clients), 0);
    const totalClients = clientRetentionData.reduce((sum, item) => sum + Number(item.total_clients), 0);
    const clientRetention = totalClients > 0 ? (totalRepClients / totalClients) * 100 : 0;

    // 🔹 Procesamiento de Value Add
    const totalProposals = valueAddData.reduce((sum, item) => sum + Number(item.proposals), 0);
    const totalCompletedProjects = valueAddData.reduce((sum, item) => sum + Number(item.projects_completed), 0);
    const valueAdd = totalCompletedProjects > 0 ? (totalProposals / totalCompletedProjects) * 100 : 0;

    // 🔹 Procesamiento de Budget Adherence & Accuracy
    const totalMoneySpent = budgetData.reduce((sum, item) => sum + Number(item.money_spent), 0);
    const totalBudgeted = budgetData.reduce((sum, item) => sum + Number(item.amount_budgeted), 0);
    const totalInvoiced = budgetData.reduce((sum, item) => sum + Number(item.amount_invoiced), 0);
    const totalForecasted = budgetData.reduce((sum, item) => sum + Number(item.amount_forecasted), 0);
    const budgetAdherence = totalBudgeted > 0 ? (totalMoneySpent / totalBudgeted) * 100 : 0;
    const budgetAccuracy = totalForecasted > 0 ? (totalInvoiced / totalForecasted) * 100 : 0;

  

    // 🔹 Mostrar valores debajo de cada gráfico
    document.getElementById("resource-utilization-value").innerText = `Resource Utilization: ${resourceUtilization.toFixed(2)}%`;
    document.getElementById("client-retention-value").innerText = `Client Retention: ${clientRetention.toFixed(2)}%`;
    document.getElementById("value-add-value").innerText = `Value Add: ${valueAdd.toFixed(2)}%`;
    document.getElementById("budget-adherence-value").innerText = `Budget Adherence: ${budgetAdherence.toFixed(2)}%`;
    document.getElementById("budget-accuracy-value").innerText = `Budget Accuracy: ${budgetAccuracy.toFixed(2)}%`;

    // 🔹 Gráfica de Resource Utilization (Doughnut)
    new Chart(document.getElementById("resource-utilization-chart"), {
        type: "doughnut",
        data: {
            labels: ["Billable Hours", "Non-Billable Hours"],
            datasets: [{
                data: [resourceUtilization, 100 - resourceUtilization],
                backgroundColor: ["#007bff", "#e0e0e0"]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true },
                title: { display: true, text: "Resource Utilization" , font: { family: "Poppins", weight: "bold", size: 18}, align: "start"}
            }
        }
    });

    // 🔹 Gráfica de Client Retention (Doughnut)
    new Chart(document.getElementById("client-retention-chart"), {
        type: "doughnut",
        data: {
            labels: ["Repeat Clients", "New Clients"],
            datasets: [{
                data: [clientRetention, 100 - clientRetention],
                backgroundColor: ["#28a745", "#dc3545"],
            }]
            
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true },
                title: { display: true, text: "Client Retention" , font: { family: "Poppins", weight: "bold", size: 18}, align: "start"}
            }
        }
    });

    // 🔹 Gráfica de Value Add (Doughnut)
    new Chart(document.getElementById("value-add-chart"), {
        type: "doughnut",
        data: {
            labels: ["Innovation Proposals", "Other Projects"],
            datasets: [{
                data: [valueAdd, 100 - valueAdd],
                backgroundColor: ["#ffc107", "#e0e0e0"]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true },
                title: { display: true, text: "Value Add" , font: { family: "Poppins", weight: "bold", size: 18}, align: "start"}
            }
        }
    });

    // 🔹 Gráfica de Budget Adherence & Accuracy (Barras)
    new Chart(document.getElementById("budget-chart"), {
        type: "bar",
        data: {
            labels: ["Budget Adherence", "Budget Accuracy"],
            datasets: [{
                label: "Percentage",
                data: [budgetAdherence, budgetAccuracy],
                backgroundColor: ["#17a2b8", "#ff5733"],
                borderRadius: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: { display: true, text: "Budget Adherence & Accuracy ", font: { family: "Poppins", weight: "bold", size: 18}, align: "start"}
            },
            scales: {
                x: { ticks: { font: { family: "Poppins" } } },
                y: { ticks: { font: { family: "Poppins" } } }
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", loadAdditionalCharts);




function updateDashboard(responses, projects) {
    const satisfaction = calculateCustomerSatisfaction(responses);
    document.getElementById('customer-satisfaction').textContent = `${satisfaction}%`;
    document.getElementById('stars').innerHTML = displayStars(satisfaction);
    document.getElementById('satisfaction-goal').textContent = satisfaction >= 70 ? "Above Goal" : "Below Goal";

    const timelyCompletion = calculateTimelyCompletion(projects);
    document.getElementById('timely-completion').textContent = `${timelyCompletion}%`;

    const ctx = document.getElementById("timely-completion-chart").getContext("2d");
    new Chart(ctx, {
    type: "doughnut",
    data: {
    labels: ["On Time", "Delayed"],
    datasets: [{
        data: [timelyCompletion, 100 - timelyCompletion],
        backgroundColor: ["#28a745", "#dc3545"]
    }]
    },
     options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true },
                title: { display: true, text: "Project Timely Completion" , font: { family: "Poppins", weight: "bold", size: 18}, align: "start"}
            }
        }
    });

    const delayedProjects = getDelayedProjects(projects);
    document.getElementById('delayed-projects').innerHTML = delayedProjects.map(p => `<li>${p.name}</li>`).join("");
}

function setCanvasBackgroundWhite() {
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach((canvas) => {
        const context = canvas.getContext('2d');
        context.globalCompositeOperation = 'destination-over';
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);
    });
}

document.getElementById('export-pdf').addEventListener('click', exportToPDF);
function exportToPDF() {
    const { jsPDF } = window.jspdf;

    setCanvasBackgroundWhite();

    const container = document.querySelector('.container');

    html2canvas(container, { scale: 1.5 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/jpeg', 0.8);
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * pageWidth) / canvas.width;

        let y = 0;

        while (y < imgHeight) {
            pdf.addImage(imgData, 'JPEG', 0, y * -1, imgWidth, imgHeight, undefined, 'FAST');
            y += pageHeight;
            if (y < imgHeight) pdf.addPage();
        }

        pdf.save('dashboard.pdf');
    }).catch((err) => {
        console.error('Error al generar PDF:', err);
    });
}

async function init() {
    const [responses, projects] = await Promise.all([
        fetchResponses(),
        fetchProjects()
    ]);

    updateDashboard(responses, projects);
    loadKPIs(responses, projects);
    loadNewCharts(responses, projects);
}

init();


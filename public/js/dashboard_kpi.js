
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
    let npsMsg ="";
    if (nps > 20) {
        // npsMsg va a ser los puntos arriba de la meta
        document.getElementById('npsMsg').style.color = '#28a745'; 
        npsMsg = `${(nps - 20).toFixed(1)}% Above the goal`;
    }  else {
        // npsMsg va a ser los puntos abajo de la meta
        document.getElementById('npsMsg').style.color = '#dc3545'; 
        npsMsg = `${(20 - nps).toFixed(1)}% Under the goal`;
    }
    

    const totalProjects = projects.length;
    const projectsWithRevisions = projects.filter((p) => p.revisions > 0).length;
    const projectsWithoutRevisions = totalProjects - projectsWithRevisions;
    const projectsWithoutRevisionsPercentage = (projectsWithoutRevisions / totalProjects) * 100;
    let projectQualityMsg ="";
    if (projectsWithoutRevisionsPercentage >= 80) {
        //projectQualityMsg va a ser los puntos arriba de la meta
        document.getElementById('projectQualityMsg').style.color = '#28a745'; 
        projectQualityMsg = `${(projectsWithoutRevisionsPercentage - 80).toFixed(1)}% Above the goal`;
        }  else {
        //projectQualityMsg va a ser los puntos abajo de la meta
        document.getElementById('projectQualityMsg').style.color = '#dc3545'; 
        projectQualityMsg = `${(80 - projectsWithoutRevisionsPercentage).toFixed(1)}% Under the goal`;
    }
    document.getElementById('projectQualityMsg').textContent = projectQualityMsg;

    document.getElementById('project-quality').textContent = `${projectsWithoutRevisionsPercentage.toFixed(1)}%`;
    document.getElementById('project-quality2').textContent = `${projectsWithoutRevisionsPercentage.toFixed(1)}%`;
    document.getElementById('nps-score').textContent = nps;
    document.getElementById('nps-score2').textContent = nps;
    document.getElementById('npsMsg').textContent = npsMsg;

    loadNPSIcons(promoterPercentage, detractorPercentage, neutralPercentage);
}

async function loadNewCharts(responses, projects) {
    const qualityData = {
        labels: ["Without reworks", "With reworks"],
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
    console.log("totalBillableHours", totalBillableHours);
    const totalProjectWorking = resourceData.reduce((sum, item) => sum + Number(item.project_working_time), 0);
    console.log("totalProjectWorking", totalProjectWorking);
    const totalHours = resourceData.reduce((sum, item) => sum + Number(item.total_hours), 0);
    const resourceUtilization = totalHours > 0 ? (totalBillableHours / totalHours) * 100 : 0;
    const efficiency = totalProjectWorking > 0 ? (totalProjectWorking / totalBillableHours) * 100 : 0;
    document.getElementById('resour').textContent = `${resourceUtilization.toFixed(1)}%`;
    document.getElementById('efficiency').textContent = `${efficiency.toFixed(1)}%`;
    let resourceUtilizationMsg;
    if (resourceUtilization >= 75) {
        //resourceUtilizationMsg va a ser los puntos arriba de la meta
        document.getElementById('resourceUtilizationMsg').style.color = '#28a745'; 
        resourceUtilizationMsg = `${(resourceUtilization - 75).toFixed(1)}% Above the goal`;
    }  else {
        //resourceUtilizationMsg va a ser los puntos abajo de la meta
        document.getElementById('resourceUtilizationMsg').style.color = '#dc3545';
        resourceUtilizationMsg = `${(75 - resourceUtilization).toFixed(1)}% Under the goal`;
    }

    // 🔹 Procesamiento de Client Retention
    const totalRepClients = clientRetentionData.reduce((sum, item) => sum + Number(item.rep_clients), 0);
    const totalClients = clientRetentionData.reduce((sum, item) => sum + Number(item.total_clients), 0);
    const clientRetention = totalClients > 0 ? (totalRepClients / totalClients) * 100 : 0;
    
    let clientRetentionMsg ="";
    if (clientRetention >= 75) {
        //clientRetentionMsg va a ser los puntos arriba de la meta
        document.getElementById('clientRetentionMsg').style.color = '#28a745'; 
        clientRetentionMsg = `${(clientRetention - 75).toFixed(1)}% Above the goal`;
    }  else {
        //clientRetentionMsg va a ser los puntos abajo de la meta
        document.getElementById('clientRetentionMsg').style.color = '#dc3545';
        clientRetentionMsg = `${(75 - clientRetention).toFixed(1)}% Under the goal`;
    }

    // 🔹 Procesamiento de Value Add
    const totalProposals = valueAddData.reduce((sum, item) => sum + Number(item.proposals), 0);
    const totalCompletedProjects = valueAddData.reduce((sum, item) => sum + Number(item.projects_completed), 0);
    const valueAdd = totalCompletedProjects > 0 ? (totalProposals / totalCompletedProjects) * 100 : 0;
    let valueAddMsg ="";
    if (valueAdd >= 60) {
        //valueAddMsg va a ser los puntos arriba de la meta
        document.getElementById('valueAddMsg').style.color = '#28a745'; 
        valueAddMsg = `${(valueAdd - 60).toFixed(0)}% Above the goal`;
    }  else {
        //valueAddMsg va a ser los puntos abajo de la meta
        document.getElementById('valueAddMsg').style.color = '#dc3545';
        valueAddMsg = `${(60 - valueAdd).toFixed(0)}% Under the goal`;
    }

    // 🔹 Procesamiento de Budget Adherence & Accuracy
    const totalMoneySpent = budgetData.reduce((sum, item) => sum + Number(item.money_spent), 0);
    const totalBudgeted = budgetData.reduce((sum, item) => sum + Number(item.amount_budgeted), 0);
    const totalInvoiced = budgetData.reduce((sum, item) => sum + Number(item.amount_invoiced), 0);
    const totalForecasted = budgetData.reduce((sum, item) => sum + Number(item.amount_forecasted), 0);
    const budgetAdherence = totalBudgeted > 0 ? (totalMoneySpent / totalBudgeted) * 100 : 0;
    const budgetAccuracy = totalForecasted > 0 ? (totalInvoiced / totalForecasted) * 100 : 0;

     // Cálculo de desviación del presupuesto y facturación
     const spendingDeviation = totalBudgeted > 0 ? ((totalMoneySpent - totalBudgeted) / totalBudgeted) * 100 : 0;
     const invoicedDeviation = totalForecasted > 0 ? ((totalInvoiced - totalForecasted) / totalForecasted) * 100 : 0;

    document.getElementById('spending-budget-value').textContent = `${spendingDeviation.toFixed(1)}%`;
    document.getElementById('invoiced-budget-value').textContent = `${invoicedDeviation.toFixed(1)}%`;
    if (spendingDeviation <= 0) {
        document.getElementById('spending-budget-value').style.color = '#28a745'; // Verde
    } else {
        document.getElementById('spending-budget-value').style.color = '#dc3545'; // Rojo
        }
    if (invoicedDeviation >= 0) {
        document.getElementById('invoiced-budget-value').style.color = '#28a745'; // Verde
    } else {
        document.getElementById('invoiced-budget-value').style.color = '#dc3545'; // Rojo
        }

    let budgetAdherenceMsg ="";
    if (budgetAdherence >= 85) {
        //budgetAdherenceMsg va a ser los puntos arriba de la meta
        document.getElementById('budgetAdherenceMsg').style.color = '#28a745'; 
        budgetAdherenceMsg = `${(budgetAdherence - 85).toFixed(1)}% Above the goal`;
    }  else {
        //budgetAdherenceMsg va a ser los puntos abajo de la meta
        document.getElementById('budgetAdherenceMsg').style.color = '#dc3545';
        budgetAdherenceMsg = `${(85 - budgetAdherence).toFixed(1)}% Under the goal`;
    }
    let budgetAccuracyMsg ="";
    if (budgetAccuracy >= 85) {
        //budgetAccuracyMsg va a ser los puntos arriba de la meta
        document.getElementById('budgetAccuracyMsg').style.color = '#28a745'; 
        budgetAccuracyMsg = `${(budgetAccuracy - 85).toFixed(1)}% Above the goal`;
    }  else {
        //budgetAccuracyMsg va a ser los puntos abajo de la meta
        document.getElementById('budgetAccuracyMsg').style.color = '#dc3545';
        budgetAccuracyMsg = `${(85 - budgetAccuracy).toFixed(1)}% Under the goal`;
    }
    
  

    // 🔹 Mostrar valores debajo de cada gráfico
    document.getElementById("resource-utilization-value").innerText = `${resourceUtilization.toFixed(1)}%`;
    document.getElementById("resourceUtilizationMsg").innerText = `${resourceUtilizationMsg}`;
    document.getElementById("client-retention-value").innerText = `${clientRetention.toFixed(1)}%`;
    document.getElementById("clientRetentionMsg").innerText = `${clientRetentionMsg}`;
    document.getElementById("value-add-value").innerText = `${valueAdd.toFixed(1)}%`;
    document.getElementById("valueAddMsg").innerText = `${valueAddMsg}`;
    document.getElementById("budget-adherence-value").innerText = `${budgetAdherence.toFixed(1)}%`;
    document.getElementById("budgetAdherenceMsg").innerText = `${budgetAdherenceMsg}`;
    document.getElementById("budget-accuracy-value").innerText = `${budgetAccuracy.toFixed(1)}%`;
    document.getElementById("budgetAccuracyMsg").innerText = `${budgetAccuracyMsg}`;

    // 🔹 Gráfica de Resource Utilization (Doughnut)
    new Chart(document.getElementById("resource-utilization-chart"), {
        type: "doughnut",
        data: {
            labels: ["Project Hours", "Non-Project Hours"],
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

  // Configuración de la gráfica de barras separadas
new Chart(document.getElementById("budget-chart"), {
    type: "bar",
    data: {
        labels: ["Budget Comparison"],
        datasets: [
            {
                label: "Spending Budget",
                data: [spendingDeviation],
                backgroundColor: spendingDeviation >= 0 ? "#28a745" : "#dc3545"
            },
            {
                label: "Invoiced Budget",
                data: [invoicedDeviation],
                backgroundColor: invoicedDeviation >= 0 ? "#17a2b8" : "#ff5733"
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        borderRadius: 10,
        plugins: {
            legend: { display: true },
            title: { 
                display: true, 
                text: "Budget", 
                font: { family: "Poppins", weight: "bold", size: 18 }, 
                align: "start"
            },
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
                        return `${tooltipItem.dataset.label}: ${tooltipItem.raw.toFixed(2)}%`;
                    }
                }
            }
        },
        scales: {
            x: {
                stacked: false,
                ticks: { font: { family: "Poppins" } }
            },
            y: {
                stacked: false,
                beginAtZero: true,
                ticks: { 
                    font: { family: "Poppins" }, 
                    callback: value => `${value.toFixed(2)}%`
                }
            }
        }
    }
});


}

document.addEventListener("DOMContentLoaded", loadAdditionalCharts);




function updateDashboard(responses, projects) {
    const satisfaction = calculateCustomerSatisfaction(responses);
    document.getElementById('customer-satisfaction').textContent = `${satisfaction}%`;
    document.getElementById('stars').innerHTML = displayStars(satisfaction);

    //aplicar colores verde si es avove goal o rojo si es below goal
    if (satisfaction >= 70) {
        document.getElementById('satisfaction-goal').style.color = '#28a745'; // Verde
    } else {
        document.getElementById('satisfaction-goal').style.color = '#dc3545'; // Rojo
    }
    document.getElementById('satisfaction-goal').textContent = satisfaction >= 70 ? "Above the goal" : "Below the goal";

    const timelyCompletion = calculateTimelyCompletion(projects);
    let timelyCompletionMsg ="";
    if (timelyCompletion >= 80) {
        // timelyCompletionMsg va a ser los puntos arriba de la meta
        document.getElementById('timelyCompletionMsg').style.color = '#28a745';
        timelyCompletionMsg = `${(timelyCompletion - 80).toFixed(1)}% Above the goal`;
    }  else {
        // timelyCompletionMsg va a ser los puntos abajo de la meta
        document.getElementById('timelyCompletionMsg').style.color = '#dc3545';
        timelyCompletionMsg = `${(80 - timelyCompletion).toFixed(1)}% Under the goal`;
    }
    document.getElementById('timely-completion').textContent = `${timelyCompletion}%`;
    document.getElementById('timely-comp').textContent = `${timelyCompletion}%`;
    document.getElementById('timelyCompletionMsg').innerText = `${timelyCompletionMsg}`;

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

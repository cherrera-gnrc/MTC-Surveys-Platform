# MTC-Surveys-Platform


GetAllProjects (GET)
Lo que te da:
https://getallprojects-dcwslcbviq-uc.a.run.app
{
    "id": "BhGejmLxFdRKW1CFrJho",
    "name": "Bolted Frame- FEA (Creo- Ansys)",
    "discipline": "Mechanical Eng",
    "finish_date": "27/06/2024, 06:00:00 p.m.",
    "on_time": "Yes",
    "revisions": "0",
    "created_at": "02/12/2024, 10:37:20 a.m."
  }

AddProject (POST)
https://addproject-dcwslcbviq-uc.a.run.app

Lo que espera:
{
  "name": "prueba postman",
  "discipline": "AP&C",
  "finish_date": "2025-01-20T00:00:00.000Z",
  "on_time": "Yes",
  "revisions": "6"
}


DeleteProject (POST)
https://deleteproject-dcwslcbviq-uc.a.run.app

Lo que espera:
{
  "id": "pXtQbIlqeZ0YCT4AvOEy"
}

	
addCustomerResponse (POST)
https://addcustomerresponse-dcwslcbviq-uc.a.run.app

{
  "name": "TX",    
  "q1": "Good", 
  "q2": "Good", 
  "q3": "Good",
  "q4": "Good", 
  "q5": "Good", 
  "q6": "Good",
  "q7": "Good", 
  "q8": "Good", 
  "q9": "Good job for everyone",
  "q10": "This is a comment for all the engineers there", 
  "q11": "Good",
  "discipline": "AP&C",
  "time_duration": "100"
}


	
getAllCustomerResponses (GET)
https://getallcustomerresponses-dcwslcbviq-uc.a.run.app

{
        "id": "3VutKmNX4mpNKIn4jWGl",
        "name": "Datalogger",
        "discipline": "AP&C",
        "q1": "Very Satisfied",
        "q2": "Excellent",
        "q3": "Very Satisfied",
        "q4": "Very Effective",
        "q5": "Excellent",
        "q6": "Very Satisfied",
        "q7": "Very Well",
        "q8": "Very Likely",
        "q9": "Hola",
        "q10": "Mundo",
        "q11": "10",
        "time_duration": "0.35",
        "created_at": "27/12/2024, 06:06:18 p.m."
    }


	
getDisciplines (GET)

https://getdisciplines-dcwslcbviq-uc.a.run.app/
{
    "id": "PFtgnyj7tW5h0sNb2Nkz",
    "discipline": "AP&C"
  }


updateProject (POST)

https://updateproject-dcwslcbviq-uc.a.run.app

{
  "id": "pXtQbIlqeZ0YCT4AvOEy",
  "name": "New Project Name",
  "finish_date": "2024-06-27T18:00:00.000Z"
}


sendEmail (POST)

https://sendemail-dcwslcbviq-uc.a.run.app

{
  "to": "destinatario@example.com",
  "subject": "Este es un correo de prueba",
  "html": "<h1>¡Hola!</h1><p>Este es un mensaje de prueba enviado desde Firebase Functions.</p>"
}


addResourceUtilization

{
  "billable_hours": 120.5,
  "total_hours": 160
}


addClientRetention

{
  "rep_clients": 50,
  "total_clients": 200
}

addValueAdd

{
  "proposals": 15,
  "projects_completed": 10
}

addBudgetAdherence

{
  "money_spent": 50000.75,
  "amount_budgeted": 60000,
  "amount_invoiced": 55000.5,
  "amount_forecasted": 62000
}



	
getResourceUtilization
https://getresourceutilization-dcwslcbviq-uc.a.run.app
{
    "id": "BkSrZxeBJOB2cH6E5VgN",
    "billable_hours": 10,
    "total_hours": 10,
    "created_at": "19/03/2025, 11:14:02 a.m."
  }
	
getClientRetention
https://getclientretention-dcwslcbviq-uc.a.run.app
 {
    "id": "TyILAndYFM2zSdX53P4w",
    "rep_clients": "5",
    "total_clients": "10",
    "created_at": "19/03/2025, 08:57:58 a.m."
  }
	
getValueAdd
https://getvalueadd-dcwslcbviq-uc.a.run.app
 {
    "id": "DVck9hzSIUzQqgOF4wXw",
    "proposals": 5,
    "projects_completed": 5,
    "created_at": "19/03/2025, 10:58:07 a.m."
  }
	
getBudgetAdherence
https://getbudgetadherence-dcwslcbviq-uc.a.run.app
{
    "id": "eCTXEFAeMubQ6JfRQU3o",
    "money_spent": 10,
    "amount_budgeted": 10,
    "amount_invoiced": 10,
    "amount_forecasted": 10,
    "created_at": "19/03/2025, 11:37:39 a.m."
  }

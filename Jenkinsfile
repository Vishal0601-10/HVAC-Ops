pipeline {
    agent any

    stages {

        stage('Clone') {
            steps {
                git 'https://github.com/Vishal0601-10/HVAC-Ops.git'
            }
        }

        stage('Build Backend') {
            steps {
                bat 'docker build -t hvac-backend .'
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    bat 'docker build -t hvac-frontend .'
                }
            }
        }

        stage('Run Containers') {
            steps {
                bat 'docker compose up -d'
            }
        }

    }
}
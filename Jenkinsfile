pipeline {
    agent any

    stages {

        stage('Build Application') {
            steps {
                dir('hvac-complete') {
                    bat 'docker compose build'
                }
            }
        }

        stage('Run Application') {
            steps {
                dir('hvac-complete') {
                    bat 'docker compose up -d'
                }
            }
        }

        stage('Verify Containers') {
            steps {
                bat 'docker ps'
            }
        }
    }
}
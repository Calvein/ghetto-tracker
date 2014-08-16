"use strict";

// jQuery
var $ = function(sel, parent) {
    parent = parent || document
    return parent.querySelector(sel)
}

/************/
/* Elements */
var $form = $('form')
// List
var $projects = $('#projects')
var $tasks = $('#tasks')
// Inputs
var $project = $('#project')
var $task = $('#task')
// Misc
var $button = $('button')
var $timer = $('#timer')


var Tracker = (function() {
    Classe.prototype.isPlaying = false

    function Classe() {
        // Populate `projects`
        this.projects = localStorage.getItem('projects')
        if (this.projects) {
            this.projects = JSON.parse(this.projects)
            Object.keys(this.projects).forEach(function(project) {
                $projects.appendChild(new Option(project))
            })
        } else {
            this.projects = {}
        }

        // If the window was closed while running
        var currentProject = JSON.parse(localStorage.getItem('currentProject'))
        if (currentProject) {
            var project = $project.value = currentProject.project
            var task = $task.value = currentProject.task
            var secs = Math.round((+new Date() - currentProject.timestamp) / 1000)
            this.projects[project][task] += secs
            this.submit()
        }

        // Events
        var self = this
        $project.addEventListener('input', this.populateProjects.bind(this))
        $form.addEventListener('submit', function(e) {
            e.preventDefault()
            self.submit()
        })

        document.addEventListener('keyup', function(e) {
            if ($(':focus')) return
            if (e.which === 32) self.submit()
        })

        window.addEventListener('unload', this.unload.bind(this))
    }

    Classe.prototype.populateProjects = function() {
        var tmp = this.projects[$project.value] || {}
        $tasks.innerHTML = ''
        Object.keys(tmp).forEach(function(task) {
            $tasks.appendChild(new Option(task))
        })
    }

    /**********/
    /* Events */
    Classe.prototype.submit = function() {
        // Get project and task
        this.project = $project.value
        this.task = $task.value
        if (!this.project && !this.task) return

        // New project
        if (Object.keys(this.projects).indexOf(this.project) === -1) {
            this.projects[this.project] = {}
            this.projects[this.project][this.task] = 0
        }

        this.saveProjects()
        // Toggle timer
        if (!this.isPlaying) {
            $button.textContent = '||'
            this.isPlaying = true
            this.startInterval()
        } else {
            $button.textContent = '>'
            this.isPlaying = false
            this.stopInterval()
        }
    }

    Classe.prototype.unload = function() {
        localStorage.removeItem('currentProject')
        if (!this.isPlaying) return
        if (!this.project && !this.task) return

        var currentProject = {
            project: this.project
          , task: this.task
          , timestamp: +new Date()
        }
        localStorage.setItem('currentProject', JSON.stringify(currentProject))
    }

    /***********/
    /* Helpers */
    Classe.prototype.startInterval = function() {
        var self = this
        this.interval = setInterval(function() {
            var time = self.projects[self.project][self.task]++
            var sec = time % 60
            var min = (time - sec) / 60 % 60
            var hours = Math.floor(time / 3600)
            // Formatting
            if (sec < 10) sec = '0' + sec
            if (min < 10) min = '0' + min

            $timer.textContent = hours + ':' + min + ':' + sec
            self.saveProjects()
        }, 1000)
    }

    Classe.prototype.stopInterval = function() {
        clearInterval(this.interval)
    }

    Classe.prototype.saveProjects = function() {
        localStorage.setItem('projects', JSON.stringify(this.projects))
    }

    return Classe
})()


window.tracker = new Tracker()

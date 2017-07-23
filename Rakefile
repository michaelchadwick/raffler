task :deploy

task :deploy do |t|
  sh "git push origin master"
  sh "dandelion deploy"
end

task :default => [:deploy]

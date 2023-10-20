from django.urls import path

from . import views

urlpatterns = [
    path('getalltodo/<str:username>', views.get_all_todo),
    path('addtodo', views.add_todo),
    path('updatetodo/<int:todo_id>', views.update_todo),
    path('deletetodo/<int:todo_id>', views.delete_todo),
]
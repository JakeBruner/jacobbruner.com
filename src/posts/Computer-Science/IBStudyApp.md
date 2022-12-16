---
title: Creating an IB-Study App With Supabase RPCs and Auth in Svelte
date: 2022-11-20
layout: blog
excerpt: How I used Svelte Typescript and Postgres to create an application for IB students to track their progress on IB Questions.
thumbnailpath: /thumbnails/ibgrind.png
tags: Website, Interactive
---

To help my peers navigate the wide-range of available resources for IB exam revision, I created a full-stack application using Svelte/Sveltekit and Typescript. The website, at <a href="www.ib-grind.com/about">ib-grind.com</a>, has full auth functionality and uses postgres functions that are triggered by client-side(!) remote procedure calls. This works because I'm using Postgres Row-Level security to selectively allow SELECT, POST, UPDATE, and DELETE actions on specific tables, using a RESTful middleware, Supabase, which I cannot recomend highly enough. Although... perhaps unfortunately for them, their amazing tutorials and step-by-step instructions gave me enough PostgreSQL knowlege to host my own dockerized Postgres using my native code for projects instead of locking myself to their proprietary Postgres wrapper software.

Here's an example of a particularly ugly postgres function I wrote:
```plsql
create or replace function mark_q_as_completed(q bigint)
returns bigint
language plpgsql
as $$
declare
  already_marked boolean;
  num int;
  uid uuid;
begin

  uid := auth.uid();

  -- get current number of questions user has completed
  select num_completed into num
    from public.users
    where id = uid;

  -- check if a record already exists for this question
  already_marked := exists (
    select 1 
    from marked_completed 
    where user_id = uid and question_id = q
  );

  -- if true
  --  update created_at
  --  return number of completed
  -- if false
  --  insert this question
  --  increment users.num_completed by one and return it

  if already_marked = true then

    update marked_completed
      set created_at = now()
      where user_id = uid and question_id = q;

    return num;

  else

    insert into marked_completed (user_id, question_id)
      values (uid, q);

    num := num + 1;

    update public.users
      set num_completed = num
      where id = uid;
    
    return num;

  end if;
end;
$$;

```